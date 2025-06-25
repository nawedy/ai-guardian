from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import json
import hashlib
from typing import Dict, List, Any
import numpy as np
from collections import defaultdict, Counter

learning_bp = Blueprint('learning', __name__)

class AdaptiveLearningEngine:
    """AI-powered adaptive learning system for user patterns and preferences"""
    
    def __init__(self):
        self.user_patterns = defaultdict(dict)
        self.false_positive_feedback = defaultdict(list)
        self.coding_patterns = defaultdict(list)
        self.preference_weights = defaultdict(lambda: defaultdict(float))
        self.learning_rate = 0.1
        
    def record_user_feedback(self, user_id: str, vulnerability_id: str, feedback: str, context: Dict):
        """Record user feedback on vulnerability detection"""
        feedback_entry = {
            'vulnerability_id': vulnerability_id,
            'feedback': feedback,  # 'true_positive', 'false_positive', 'ignore'
            'context': context,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if feedback == 'false_positive':
            self.false_positive_feedback[user_id].append(feedback_entry)
            self._update_false_positive_patterns(user_id, context)
        
        self._update_user_preferences(user_id, feedback_entry)
        
        return {
            'status': 'recorded',
            'user_id': user_id,
            'feedback_id': hashlib.md5(f"{user_id}_{vulnerability_id}_{datetime.utcnow()}".encode()).hexdigest()[:16]
        }
    
    def record_coding_pattern(self, user_id: str, code_snippet: str, language: str, context: Dict):
        """Record user coding patterns for learning"""
        pattern_entry = {
            'code_snippet': code_snippet,
            'language': language,
            'context': context,
            'timestamp': datetime.utcnow().isoformat(),
            'features': self._extract_code_features(code_snippet, language)
        }
        
        self.coding_patterns[user_id].append(pattern_entry)
        self._update_coding_preferences(user_id, pattern_entry)
        
        return {
            'status': 'recorded',
            'pattern_id': hashlib.md5(f"{user_id}_{code_snippet}_{datetime.utcnow()}".encode()).hexdigest()[:16]
        }
    
    def get_personalized_thresholds(self, user_id: str) -> Dict[str, float]:
        """Get personalized vulnerability detection thresholds for user"""
        default_thresholds = {
            'SQL_INJECTION': 0.8,
            'XSS': 0.8,
            'HARDCODED_SECRET': 0.9,
            'CODE_INJECTION': 0.9,
            'CSRF': 0.7
        }
        
        if user_id not in self.preference_weights:
            return default_thresholds
        
        personalized = {}
        for vuln_type, default_threshold in default_thresholds.items():
            weight = self.preference_weights[user_id].get(vuln_type, 0.0)
            # Adjust threshold based on user feedback patterns
            adjusted_threshold = default_threshold + (weight * 0.2)
            personalized[vuln_type] = max(0.1, min(1.0, adjusted_threshold))
        
        return personalized
    
    def get_user_preferences(self, user_id: str) -> Dict:
        """Get user preferences and learned patterns"""
        return {
            'thresholds': self.get_personalized_thresholds(user_id),
            'false_positive_patterns': len(self.false_positive_feedback.get(user_id, [])),
            'coding_patterns': len(self.coding_patterns.get(user_id, [])),
            'preference_weights': dict(self.preference_weights.get(user_id, {})),
            'last_updated': datetime.utcnow().isoformat()
        }
    
    def predict_false_positive(self, user_id: str, vulnerability: Dict) -> float:
        """Predict likelihood that a vulnerability is a false positive for this user"""
        if user_id not in self.false_positive_feedback:
            return 0.0
        
        # Extract features from the vulnerability
        vuln_features = self._extract_vulnerability_features(vulnerability)
        
        # Compare with historical false positives
        false_positives = self.false_positive_feedback[user_id]
        if not false_positives:
            return 0.0
        
        similarity_scores = []
        for fp in false_positives:
            fp_features = self._extract_vulnerability_features(fp['context'])
            similarity = self._calculate_feature_similarity(vuln_features, fp_features)
            similarity_scores.append(similarity)
        
        # Return average similarity as false positive probability
        return np.mean(similarity_scores) if similarity_scores else 0.0
    
    def recommend_coding_improvements(self, user_id: str, code: str, language: str) -> List[Dict]:
        """Recommend coding improvements based on user patterns"""
        recommendations = []
        
        if user_id not in self.coding_patterns:
            return recommendations
        
        user_patterns = self.coding_patterns[user_id]
        code_features = self._extract_code_features(code, language)
        
        # Analyze patterns and suggest improvements
        pattern_analysis = self._analyze_user_patterns(user_patterns, code_features)
        
        if pattern_analysis['suggests_refactoring']:
            recommendations.append({
                'type': 'refactoring',
                'message': 'Consider refactoring this code based on your typical patterns',
                'confidence': pattern_analysis['refactoring_confidence']
            })
        
        if pattern_analysis['suggests_security_improvement']:
            recommendations.append({
                'type': 'security',
                'message': 'This pattern differs from your usual secure coding practices',
                'confidence': pattern_analysis['security_confidence']
            })
        
        return recommendations
    
    def _update_false_positive_patterns(self, user_id: str, context: Dict):
        """Update false positive patterns for user"""
        vuln_type = context.get('type', 'UNKNOWN')
        if vuln_type in self.preference_weights[user_id]:
            # Decrease weight for this vulnerability type (more likely to be false positive)
            self.preference_weights[user_id][vuln_type] -= self.learning_rate
        else:
            self.preference_weights[user_id][vuln_type] = -self.learning_rate
    
    def _update_user_preferences(self, user_id: str, feedback_entry: Dict):
        """Update user preferences based on feedback"""
        context = feedback_entry['context']
        feedback = feedback_entry['feedback']
        vuln_type = context.get('type', 'UNKNOWN')
        
        if feedback == 'true_positive':
            # Increase weight for this vulnerability type
            self.preference_weights[user_id][vuln_type] += self.learning_rate
        elif feedback == 'false_positive':
            # Decrease weight for this vulnerability type
            self.preference_weights[user_id][vuln_type] -= self.learning_rate
    
    def _update_coding_preferences(self, user_id: str, pattern_entry: Dict):
        """Update coding preferences based on patterns"""
        features = pattern_entry['features']
        language = pattern_entry['language']
        
        # Update language-specific preferences
        lang_key = f"language_{language}"
        if lang_key not in self.preference_weights[user_id]:
            self.preference_weights[user_id][lang_key] = 0.0
        
        self.preference_weights[user_id][lang_key] += 0.05  # Small increment for usage
    
    def _extract_code_features(self, code: str, language: str) -> Dict:
        """Extract features from code snippet"""
        features = {
            'length': len(code),
            'lines': len(code.split('\n')),
            'language': language,
            'has_imports': 'import ' in code or 'from ' in code,
            'has_functions': 'def ' in code or 'function ' in code,
            'has_classes': 'class ' in code,
            'has_comments': '#' in code or '//' in code or '/*' in code,
            'complexity_score': self._calculate_complexity(code)
        }
        return features
    
    def _extract_vulnerability_features(self, vulnerability: Dict) -> Dict:
        """Extract features from vulnerability context"""
        return {
            'type': vulnerability.get('type', 'UNKNOWN'),
            'severity': vulnerability.get('severity', 'UNKNOWN'),
            'line_number': vulnerability.get('line', 0),
            'code_length': len(vulnerability.get('code_snippet', '')),
            'file_type': vulnerability.get('file', '').split('.')[-1] if '.' in vulnerability.get('file', '') else 'unknown'
        }
    
    def _calculate_feature_similarity(self, features1: Dict, features2: Dict) -> float:
        """Calculate similarity between two feature sets"""
        common_keys = set(features1.keys()) & set(features2.keys())
        if not common_keys:
            return 0.0
        
        similarities = []
        for key in common_keys:
            val1, val2 = features1[key], features2[key]
            if isinstance(val1, str) and isinstance(val2, str):
                similarity = 1.0 if val1 == val2 else 0.0
            elif isinstance(val1, (int, float)) and isinstance(val2, (int, float)):
                max_val = max(abs(val1), abs(val2), 1)
                similarity = 1.0 - abs(val1 - val2) / max_val
            else:
                similarity = 1.0 if val1 == val2 else 0.0
            similarities.append(similarity)
        
        return np.mean(similarities)
    
    def _calculate_complexity(self, code: str) -> float:
        """Calculate code complexity score"""
        # Simple complexity metric based on control structures
        complexity_keywords = ['if', 'else', 'elif', 'for', 'while', 'try', 'except', 'with']
        complexity_score = sum(code.lower().count(keyword) for keyword in complexity_keywords)
        return min(complexity_score / len(code.split('\n')), 1.0)  # Normalize by lines
    
    def _analyze_user_patterns(self, patterns: List[Dict], current_features: Dict) -> Dict:
        """Analyze user patterns and compare with current code"""
        if not patterns:
            return {
                'suggests_refactoring': False,
                'suggests_security_improvement': False,
                'refactoring_confidence': 0.0,
                'security_confidence': 0.0
            }
        
        # Calculate average features from user patterns
        avg_complexity = np.mean([p['features']['complexity_score'] for p in patterns])
        avg_length = np.mean([p['features']['length'] for p in patterns])
        
        # Compare current code with user's typical patterns
        complexity_diff = abs(current_features['complexity_score'] - avg_complexity)
        length_diff = abs(current_features['length'] - avg_length) / max(avg_length, 1)
        
        suggests_refactoring = complexity_diff > 0.3 or length_diff > 0.5
        suggests_security = current_features['complexity_score'] > avg_complexity * 1.5
        
        return {
            'suggests_refactoring': suggests_refactoring,
            'suggests_security_improvement': suggests_security,
            'refactoring_confidence': min(complexity_diff + length_diff, 1.0),
            'security_confidence': min(complexity_diff * 2, 1.0)
        }

# Initialize learning engine
learning_engine = AdaptiveLearningEngine()

@learning_bp.route('/feedback', methods=['POST'])
def record_feedback():
    """Record user feedback on vulnerability detection"""
    try:
        data = request.json
        
        required_fields = ['user_id', 'vulnerability_id', 'feedback']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        user_id = data['user_id']
        vulnerability_id = data['vulnerability_id']
        feedback = data['feedback']
        context = data.get('context', {})
        
        result = learning_engine.record_user_feedback(user_id, vulnerability_id, feedback, context)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@learning_bp.route('/patterns', methods=['POST'])
def record_pattern():
    """Record user coding pattern"""
    try:
        data = request.json
        
        required_fields = ['user_id', 'code_snippet', 'language']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        user_id = data['user_id']
        code_snippet = data['code_snippet']
        language = data['language']
        context = data.get('context', {})
        
        result = learning_engine.record_coding_pattern(user_id, code_snippet, language, context)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@learning_bp.route('/preferences/<user_id>', methods=['GET'])
def get_preferences(user_id):
    """Get user preferences and learned patterns"""
    try:
        preferences = learning_engine.get_user_preferences(user_id)
        return jsonify(preferences), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@learning_bp.route('/thresholds/<user_id>', methods=['GET'])
def get_thresholds(user_id):
    """Get personalized vulnerability detection thresholds"""
    try:
        thresholds = learning_engine.get_personalized_thresholds(user_id)
        return jsonify({'thresholds': thresholds}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@learning_bp.route('/predict-false-positive', methods=['POST'])
def predict_false_positive():
    """Predict if a vulnerability is likely a false positive for user"""
    try:
        data = request.json
        
        required_fields = ['user_id', 'vulnerability']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        user_id = data['user_id']
        vulnerability = data['vulnerability']
        
        probability = learning_engine.predict_false_positive(user_id, vulnerability)
        
        return jsonify({
            'false_positive_probability': probability,
            'confidence': 'high' if probability > 0.7 else 'medium' if probability > 0.3 else 'low'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@learning_bp.route('/recommendations', methods=['POST'])
def get_recommendations():
    """Get coding improvement recommendations based on user patterns"""
    try:
        data = request.json
        
        required_fields = ['user_id', 'code', 'language']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        user_id = data['user_id']
        code = data['code']
        language = data['language']
        
        recommendations = learning_engine.recommend_coding_improvements(user_id, code, language)
        
        return jsonify({'recommendations': recommendations}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@learning_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'adaptive-learning',
        'timestamp': datetime.utcnow().isoformat(),
        'total_users': len(learning_engine.user_patterns),
        'total_feedback_entries': sum(len(feedback) for feedback in learning_engine.false_positive_feedback.values())
    })

