import requests
import json
import base64
from typing import List, Dict, Any
from PIL import Image
import io
import os

class AIService:
    def __init__(self, ollama_url: str = "http://localhost:11434"):
        self.ollama_url = ollama_url
        self.model_name = "llava"  # Multimodal model
    
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
        Analyze uploaded image and find matching spare parts
        """
        try:
            # Convert image to base64
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # Create prompt for the AI model
            parts_info = "\n".join([
                f"Material: {part['material_number']}, Description: {part['description']}, Category: {part.get('category', 'N/A')}"
                for part in spare_parts_data
            ])
            
            prompt = f"""
            Analyze this image of a spare part and identify which parts from the following list it most likely matches.
            Consider visual characteristics like shape, color, size, and any visible markings or text.
            
            Available parts:
            {parts_info}
            
            For each potential match, provide:
            1. Material number
            2. Confidence score (0-1)
            3. Reason for the match
            
            Return your response as a JSON array with objects containing: material_number, confidence_score, match_reason
            """
            
            # Prepare request to Ollama
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "images": [image_base64],
                "stream": False
            }
            
            # Make request to Ollama
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result.get('response', '')
                
                # Try to parse JSON response
                try:
                    # Extract JSON from the response (AI might include extra text)
                    json_start = ai_response.find('[')
                    json_end = ai_response.rfind(']') + 1
                    if json_start != -1 and json_end != 0:
                        json_str = ai_response[json_start:json_end]
                        matches = json.loads(json_str)
                    else:
                        # Fallback: create a simple match based on the response
                        matches = self._fallback_analysis(ai_response, spare_parts_data)
                    
                    return matches
                    
                except json.JSONDecodeError:
                    # Fallback analysis if JSON parsing fails
                    return self._fallback_analysis(ai_response, spare_parts_data)
            else:
                print(f"Ollama API error: {response.status_code}")
                return self._fallback_analysis("", spare_parts_data)
                
        except Exception as e:
            print(f"Error in AI analysis: {str(e)}")
            return self._fallback_analysis("", spare_parts_data)
    
    def _fallback_analysis(self, ai_response: str, spare_parts_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Fallback analysis when AI model is not available or fails
        """
        # Return first few parts with low confidence as fallback
        fallback_matches = []
        for i, part in enumerate(spare_parts_data[:3]):
            fallback_matches.append({
                "material_number": part['material_number'],
                "confidence_score": 0.3 - (i * 0.1),  # Decreasing confidence
                "match_reason": "Fallback analysis - please verify manually"
            })
        return fallback_matches
    
    def is_model_available(self) -> bool:
        """Check if the Ollama model is available"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get('models', [])
                return any(model['name'] == self.model_name for model in models)
            return False
        except:
            return False 