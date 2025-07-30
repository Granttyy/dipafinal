# 🧠 Feedback Learning System

## Overview

The UniFinder feedback learning system allows the recommendation model to learn from user feedback and continuously improve its accuracy. The system collects user feedback on recommendations, stores it in the database, and uses it to retrain the model periodically.

## 🎯 Features

### 1. **User Feedback Collection**
- **Three feedback types**: 👍 Helpful, 👎 Not Helpful, ❌ Not Relevant
- **Automatic data collection**: User answers, embeddings, and recommended programs
- **Session tracking**: Each feedback is tied to a unique session

### 2. **Machine Learning Integration**
- **Feedback-based scoring**: Recommendations now include feedback predictions
- **Model retraining**: Automatic retraining when sufficient feedback is collected
- **Parameter optimization**: Thresholds and weights adjust based on feedback patterns

### 3. **Admin Dashboard**
- **Real-time statistics**: View feedback counts and distributions
- **Model management**: Trigger manual retraining and monitor performance
- **Performance metrics**: Track improvement scores and training times

## 🏗️ Architecture

### Backend Components

#### 1. **Database Collections**
- `user_feedback`: Stores all user feedback data
- `feedback_model.pkl`: Serialized trained model

#### 2. **API Endpoints**
- `POST /feedback`: Submit user feedback
- `POST /model/retrain`: Trigger model retraining
- `GET /feedback/stats`: Get feedback statistics

#### 3. **Core Functions**
- `train_feedback_model()`: Train ML model on feedback data
- `predict_user_satisfaction()`: Predict user satisfaction for programs
- `update_recommendation_parameters()`: Adjust algorithm parameters

### Frontend Components

#### 1. **Feedback UI**
- Feedback buttons in Results page
- Loading states and success messages
- One-time submission per session

#### 2. **Admin Dashboard**
- Statistics visualization
- Model retraining controls
- Performance monitoring

## 🔧 Implementation Details

### Feedback Data Structure

```json
{
  "session_id": "unique_session_id",
  "user_answers": {
    "subjects": ["Math", "Science"],
    "fields": ["Technology"],
    // ... other user inputs
  },
  "user_embeddings": {
    "subjects": [0.1, 0.2, ...],
    "fields": [0.3, 0.4, ...],
    // ... vector representations
  },
  "recommended_programs": [
    {
      "school": "University Name",
      "program": "Program Name",
      "score": 0.85,
      // ... program details
    }
  ],
  "feedback_type": "positive|negative|not_relevant",
  "feedback_details": "Optional user comments",
  "selected_program": "Program user actually chose",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Model Learning Process

1. **Feature Extraction**: Convert feedback data into numerical features
2. **Label Creation**: Map feedback types to satisfaction scores (1.0, 0.0, 0.5)
3. **Model Training**: Train Random Forest on user embeddings + program features
4. **Prediction**: Use trained model to predict satisfaction for new recommendations
5. **Score Combination**: Combine similarity, rating, and feedback scores

### Scoring Formula

```
Final Score = (Base Score × (1 - Feedback Weight)) + (Feedback Score × Feedback Weight)

Where:
- Base Score = (Similarity × (1 - Category Weight)) + (Rating Score × Category Weight)
- Feedback Score = Predicted user satisfaction (0.0 to 1.0)
- Feedback Weight = 0.2 (adjustable based on feedback patterns)
```

## 🚀 Usage

### For Users

1. **Complete the questionnaire** in UniFinder
2. **View recommendations** on the Results page
3. **Provide feedback** using the three buttons:
   - 👍 **Helpful**: Recommendations were relevant and useful
   - 👎 **Not Helpful**: Recommendations were not what you were looking for
   - ❌ **Not Relevant**: Recommendations were completely off-topic

### For Administrators

1. **Access admin dashboard**: Navigate to `/admin`
2. **Monitor feedback**: View statistics and distributions
3. **Trigger retraining**: Click "Retrain Model" when sufficient data is collected
4. **Track improvements**: Monitor performance metrics

### For Developers

#### Testing the System

```bash
# Run the test script
cd backend
python test_feedback.py
```

#### Manual API Testing

```bash
# Submit feedback
curl -X POST http://127.0.0.1:8000/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_123",
    "user_answers": {...},
    "user_embeddings": {...},
    "recommended_programs": [...],
    "feedback_type": "positive"
  }'

# Get statistics
curl http://127.0.0.1:8000/feedback/stats

# Trigger retraining
curl -X POST http://127.0.0.1:8000/model/retrain \
  -H "Content-Type: application/json" \
  -d '{"force_retrain": false, "min_feedback_count": 50}'
```

## 📊 Performance Metrics

### Model Performance
- **MSE (Mean Squared Error)**: Lower is better
- **R² Score**: Higher is better (0.0 to 1.0)
- **Training Time**: Seconds to complete retraining

### System Performance
- **Feedback Collection Rate**: Percentage of users who provide feedback
- **Positive Feedback Rate**: Percentage of positive feedback
- **Improvement Score**: Change in positive feedback rate over time

## 🔄 Retraining Triggers

### Automatic Triggers
- **Feedback threshold**: 100+ feedback samples
- **Time-based**: Weekly retraining (if sufficient data)
- **Performance-based**: When positive feedback rate drops

### Manual Triggers
- **Admin dashboard**: Manual retraining button
- **API endpoint**: Direct API call with force_retrain=true

## 🛠️ Configuration

### Environment Variables
```bash
# MongoDB connection
MONGO_URI=mongodb://localhost:27017/unifinder

# Model parameters
FEEDBACK_WEIGHT=0.2
CATEGORY_WEIGHT=0.3
THRESHOLD=0.3
```

### Model Parameters
- **Minimum feedback count**: 50 samples for training
- **Test split**: 20% for validation
- **Random Forest**: 100 estimators
- **Feature dimensions**: 70 (10 per category + 5 program features)

## 🔮 Future Enhancements

### Planned Features
1. **Advanced NLP**: Sentiment analysis of feedback comments
2. **A/B Testing**: Compare different recommendation algorithms
3. **Personalization**: User-specific model fine-tuning
4. **Real-time Learning**: Incremental model updates
5. **Feedback Analytics**: Detailed insights and trends

### Technical Improvements
1. **Model Versioning**: Track model performance over time
2. **Feature Engineering**: More sophisticated feature extraction
3. **Ensemble Methods**: Combine multiple ML models
4. **Online Learning**: Continuous model updates
5. **Performance Monitoring**: Automated alerts and dashboards

## 🐛 Troubleshooting

### Common Issues

1. **Model not training**: Check if sufficient feedback data exists
2. **Low accuracy**: May need more diverse feedback samples
3. **Slow performance**: Consider reducing feature dimensions
4. **Memory issues**: Monitor model file size and cleanup old models

### Debug Commands

```bash
# Check feedback count
curl http://127.0.0.1:8000/feedback/stats

# Force retraining with minimal data
curl -X POST http://127.0.0.1:8000/model/retrain \
  -H "Content-Type: application/json" \
  -d '{"force_retrain": true, "min_feedback_count": 10}'

# Check model file
ls -la feedback_model.pkl
```

## 📝 Contributing

When contributing to the feedback learning system:

1. **Test thoroughly**: Use the test script before deploying
2. **Monitor performance**: Track metrics after changes
3. **Document changes**: Update this README
4. **Backup models**: Save model files before major changes

---

**Note**: This system is designed to improve over time as more user feedback is collected. Initial recommendations may be less accurate until sufficient feedback data is gathered. 