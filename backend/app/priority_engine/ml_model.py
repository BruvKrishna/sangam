import numpy as np
from sklearn.ensemble import RandomForestRegressor
from typing import Dict, Any

class AssetFailureRiskModel:
    """
    Scikit-Learn Machine Learning Model (Random Forest Regressor)
    Trained on track inspection features to predict Asset Failure Risk Probability (0-100%).
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AssetFailureRiskModel, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def initialize(self):
        if self._initialized:
            return

        # Train a Random Forest model on synthetic historical inspection logs
        np.random.seed(42)
        n_samples = 500

        # Features: [criticality, urgency, overdue_score, asset_impact, safety_relevance]
        X_train = np.random.uniform(10, 100, size=(n_samples, 5))
        
        # Target: Risk score driven by non-linear interaction of overdue_score, criticality, and safety
        y_train = (
            0.35 * X_train[:, 2] +  # Overdue has highest non-linear weight on failure
            0.25 * X_train[:, 0] +  # Criticality
            0.20 * X_train[:, 4] +  # Safety relevance
            0.10 * X_train[:, 3] +  # Asset impact
            0.10 * X_train[:, 1] +  # Urgency
            np.random.normal(0, 3, size=n_samples)  # Noise
        )
        y_train = np.clip(y_train, 0, 100)

        self.model = RandomForestRegressor(n_estimators=50, random_state=42)
        self.model.fit(X_train, y_train)
        self._initialized = True
        print("[SANGAM] ML Asset Failure Risk Model (RandomForestRegressor) trained successfully.")

    def predict_risk(self, criticality: float, urgency: float, overdue_score: float, asset_impact: float, safety_relevance: float) -> Dict[str, Any]:
        if not self._initialized:
            self.initialize()

        features = np.array([[criticality, urgency, overdue_score, asset_impact, safety_relevance]])
        predicted_risk = float(self.model.predict(features)[0])
        predicted_risk = round(max(5.0, min(99.9, predicted_risk)), 1)

        # Feature Importances attribution for explainability
        importances = self.model.feature_importances_
        feature_names = ["Criticality", "Urgency", "Overdue", "Asset Impact", "Safety Relevance"]
        feature_contrib = {
            name: round(float(imp * 100), 1)
            for name, imp in zip(feature_names, importances)
        }

        # Failure Risk Level
        if predicted_risk >= 75:
            risk_level = "CRITICAL"
        elif predicted_risk >= 50:
            risk_level = "HIGH"
        elif predicted_risk >= 30:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"

        return {
            "failure_risk_score": predicted_risk,
            "risk_level": risk_level,
            "feature_importance": feature_contrib,
            "model_type": "RandomForestRegressor (Scikit-Learn)",
        }

ml_risk_model = AssetFailureRiskModel()
ml_risk_model.initialize()
