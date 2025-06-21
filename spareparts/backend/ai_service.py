import os
import json
import base64
from typing import List, Dict, Any
from PIL import Image
import io
import numpy as np
import cv2

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not available. Make sure OPENAI_API_KEY is set in environment.")

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    print("Warning: OpenAI library not available. AI features will be disabled.")
    OPENAI_AVAILABLE = False

EMBEDDINGS_FILE = os.path.join(os.path.dirname(__file__), "part_image_embeddings.npy")
MAPPING_FILE = os.path.join(os.path.dirname(__file__), "part_image_embeddings_map.json")
IMAGES_ROOT = os.path.join(os.path.dirname(__file__), "images")

# Initialize SIFT detector and FLANN matcher
sift = cv2.SIFT_create()
FLANN_INDEX_KDTREE = 1
index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
search_params = dict(checks=50)
flann = cv2.FlannBasedMatcher(index_params, search_params)

def serialize_keypoints(keypoints):
    """Convert cv2.KeyPoint objects to a serializable list of dicts"""
    return [
        {
            'pt': kp.pt,
            'size': kp.size,
            'angle': kp.angle,
            'response': kp.response,
            'octave': kp.octave,
            'class_id': kp.class_id
        }
        for kp in keypoints
    ]

def deserialize_keypoints(serialized_keypoints):
    """Convert serialized keypoints back to cv2.KeyPoint objects"""
    keypoints = []
    for kp_dict in serialized_keypoints:
        kp = cv2.KeyPoint(
            x=kp_dict['pt'][0],
            y=kp_dict['pt'][1],
            size=kp_dict['size'],
            angle=kp_dict['angle'],
            response=kp_dict['response'],
            octave=kp_dict['octave'],
            class_id=kp_dict['class_id']
        )
        keypoints.append(kp)
    return keypoints

def get_image_features_from_bytes(image_bytes):
    """Extract SIFT keypoints and descriptors from image bytes"""
    try:
        # Convert bytes to numpy array
        image_array = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        if img is None:
            print(f"⚠️ Could not decode uploaded image")
            return None, None
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        keypoints, descriptors = sift.detectAndCompute(gray, None)
        
        if descriptors is None or len(keypoints) < 10:
            print(f"⚠️ Insufficient SIFT features found in uploaded image")
            return None, None
            
        return keypoints, descriptors
    except Exception as e:
        print(f"❌ Error processing uploaded image: {e}")
        return None, None

def compute_image_similarity(query_keypoints, query_descriptors, stored_keypoints, stored_descriptors):
    """
    Compute similarity between two images using SIFT feature matching
    Returns a similarity score between 0 and 1
    """
    if query_descriptors is None or stored_descriptors is None:
        return 0.0
    
    try:
        # Use FLANN matcher for better performance
        matches = flann.knnMatch(query_descriptors, stored_descriptors, k=2)
        
        # Apply Lowe's ratio test to filter good matches
        good_matches = []
        for match_pair in matches:
            if len(match_pair) == 2:
                m, n = match_pair
                if m.distance < 0.8 * n.distance:  # Slightly more lenient ratio test
                    good_matches.append(m)
        
        # Calculate similarity score based on number of good matches
        # Normalize by the minimum number of keypoints to avoid bias
        min_keypoints = min(len(query_keypoints), len(stored_keypoints))
        if min_keypoints == 0:
            return 0.0
        
        # Use a more lenient scoring approach
        match_ratio = len(good_matches) / min_keypoints
        
        # Apply sigmoid function to get a score between 0 and 1
        # Adjusted parameters to be more lenient
        similarity = 1 / (1 + np.exp(-8 * (match_ratio - 0.15)))
        
        return similarity
        
    except Exception as e:
        print(f"❌ Error computing similarity: {e}")
        return 0.0

class AIService:
    def __init__(self, api_key: str = None):
        # No API key needed for local SIFT
        print("✅ AIService initialized for local SIFT-based similarity search")
        # Load embeddings and mapping at init
        self.stored_features = None
        self.mapping = None
        self._load_features()

    def _load_features(self):
        try:
            # Load stored features (keypoints and descriptors)
            features_data = np.load(EMBEDDINGS_FILE, allow_pickle=True)
            self.stored_features = features_data
            
            with open(MAPPING_FILE, 'r') as f:
                self.mapping = json.load(f)
            print(f"✅ Loaded {len(self.stored_features)} feature sets and mapping")
        except Exception as e:
            print(f"❌ Error loading features or mapping: {e}")
            self.stored_features = None
            self.mapping = None

    def encode_image_to_base64(self, image_path: str) -> str:
        """Convert image to base64 string"""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    
    def encode_pil_image_to_base64(self, image: Image.Image) -> str:
        """Convert PIL image to base64 string"""
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG')
        img_str = base64.b64encode(buffer.getvalue()).decode('utf-8')
        return img_str
    
    def analyze_image(self, image_data: bytes, spare_parts_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyze uploaded image and find matching spare parts using SIFT-based similarity
        """
        if self.stored_features is None or self.mapping is None:
            print("❌ Features or mapping not loaded, using fallback analysis")
            return self._fallback_analysis("", spare_parts_data)
        
        print(f"🔍 Starting SIFT similarity analysis with {len(self.mapping)} stored images")
        
        # Compute features for uploaded image
        query_keypoints, query_descriptors = get_image_features_from_bytes(image_data)
        if query_keypoints is None or query_descriptors is None:
            print("❌ Could not compute features for uploaded image, using fallback")
            return self._fallback_analysis("", spare_parts_data)
        
        # Compute similarity to all stored images
        similarities = []
        for i, stored_feature in enumerate(self.stored_features):
            # Deserialize stored keypoints back to cv2.KeyPoint objects
            stored_keypoints = deserialize_keypoints(stored_feature['keypoints'])
            stored_descriptors = stored_feature['descriptors']
            
            similarity = compute_image_similarity(
                query_keypoints, query_descriptors,
                stored_keypoints, stored_descriptors
            )
            similarities.append(similarity)
            print(f"   Similarity with {self.mapping[i]['material_number']}: {similarity:.3f}")
        
        # Get top matches with higher minimum similarity threshold for more selective matching
        min_similarity_threshold = 0.6  # Increased to 60% for high-confidence matches only
        valid_matches = []
        
        for idx, sim_score in enumerate(similarities):
            if sim_score >= min_similarity_threshold:
                part_info = self.mapping[idx]
                valid_matches.append({
                    "material_number": part_info["material_number"],
                    "confidence_score": float(sim_score),
                    "match_reason": f"SIFT feature matching: {sim_score:.3f} ({len(query_keypoints)} vs {len(self.stored_features[idx]['keypoints'])} keypoints)"
                })
        
        # Sort by confidence score and take only the best match if it's very high confidence
        valid_matches.sort(key=lambda x: x["confidence_score"], reverse=True)
        
        # Only return matches if we have high confidence
        if valid_matches:
            best_match = valid_matches[0]
            # If the best match is very high confidence (>90%), return only that one
            if best_match["confidence_score"] > 0.9:
                matches = [best_match]
                print(f"✅ Found 1 high-confidence match: {best_match['confidence_score']:.3f}")
            else:
                # Otherwise return up to 2 matches above threshold
                matches = valid_matches[:2]
                print(f"✅ Found {len(matches)} good matches using SIFT similarity")
        else:
            matches = []
            print("⚠️ No high-confidence matches found")
        
        # If no valid matches found, return fallback
        if not matches:
            print("⚠️ No matches above threshold, using fallback analysis")
            return self._fallback_analysis("", spare_parts_data)
        
        return matches

    def _fallback_analysis(self, ai_response: str, spare_parts_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        print("🔄 Using fallback analysis - returning first 3 parts with low confidence")
        fallback_matches = []
        for i, part in enumerate(spare_parts_data[:3]):
            fallback_matches.append({
                "material_number": part['material_number'],
                "confidence_score": 0.3 - (i * 0.1),
                "match_reason": "Fallback analysis - please verify manually"
            })
        return fallback_matches

    def is_model_available(self) -> bool:
        # Always available for local SIFT
        return self.stored_features is not None and self.mapping is not None 