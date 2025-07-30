# Testing Guide for Feedback Learning System

## 🧪 Overview
This guide covers how to test the newly implemented feedback learning system that allows the recommendation model to learn from user feedback and improve over time.

## 📋 Prerequisites
1. **Backend running**: `cd backend && python main.py`
2. **Frontend running**: `cd frontend && npm run dev`
3. **MongoDB running**: Ensure your MongoDB instance is active
4. **Dependencies installed**: All required packages should be installed

## 🚀 Quick Start Testing

### 1. Automated Testing (Recommended)
Use the provided test script to simulate user interactions:

```bash
cd backend
python test_feedback.py
```

This script will:
- Simulate 9 user searches (3 rounds × 3 feedback types)
- Submit feedback for each search
- Trigger model retraining
- Display results and statistics

### 2. Manual Testing

#### Step 1: User Journey Testing
1. **Open the application**: Navigate to `http://localhost:5173`
2. **Complete a search**:
   - Fill out the questionnaire with realistic answers
   - Submit the search
   - Review the recommendations

3. **Submit feedback**:
   - Look for the feedback section at the bottom of results
   - Click one of the three options:
     - 👍 **Helpful** (positive feedback)
     - 👎 **Not Helpful** (negative feedback)
     - ❌ **Not Relevant** (neutral feedback)

4. **Verify feedback submission**:
   - You should see a success message
   - Check the browser console for any errors

#### Step 2: Admin Dashboard Testing
1. **Access admin dashboard**: Navigate to `http://localhost:5173/admin`
2. **Check initial statistics**:
   - Total feedback count
   - Recent feedback (7 days)
   - Ready for retraining status
   - Model status

3. **Monitor feedback distribution**:
   - View the breakdown of feedback types
   - Verify percentages add up correctly

4. **Trigger manual retraining**:
   - Click "Retrain Model" button (requires 50+ feedback samples)
   - Monitor the retraining process
   - Review the results and improvement metrics

## 🔍 Detailed Testing Scenarios

### Scenario 1: First-Time User
**Objective**: Test the system with no existing feedback data

**Steps**:
1. Clear any existing feedback data from MongoDB
2. Run a search and submit feedback
3. Check that feedback is stored correctly
4. Verify admin dashboard shows 1 total feedback

**Expected Results**:
- Feedback stored in `user_feedback` collection
- Admin dashboard shows correct statistics
- Model status shows "Training" (not enough data)

### Scenario 2: Feedback Accumulation
**Objective**: Test the system as it accumulates feedback

**Steps**:
1. Submit multiple feedback samples (at least 10 for testing)
2. Monitor the admin dashboard statistics
3. Check feedback distribution
4. Verify "Ready for Retraining" status changes

**Expected Results**:
- Statistics update in real-time
- Distribution shows all feedback types
- Ready for retraining becomes "Yes" after sufficient data

### Scenario 3: Model Retraining
**Objective**: Test the model learning functionality

**Steps**:
1. Ensure you have 50+ feedback samples
2. Trigger model retraining from admin dashboard
3. Monitor the retraining process
4. Check improvement metrics

**Expected Results**:
- Retraining completes successfully
- Training time is reasonable (< 30 seconds)
- Improvement score is calculated
- Model files are updated

### Scenario 4: Recommendation Quality Improvement
**Objective**: Test if recommendations improve after learning

**Steps**:
1. Note initial recommendation quality
2. Submit diverse feedback (mix of positive/negative)
3. Retrain the model
4. Run the same search again
5. Compare recommendation quality

**Expected Results**:
- Recommendations should show some improvement
- Scores may be adjusted based on learned patterns
- User satisfaction should increase over time

## 🛠️ Technical Testing

### Backend API Testing

#### Test Feedback Endpoint
```bash
curl -X POST http://127.0.0.1:8000/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_session_123",
    "user_answers": {"subjects": ["Math"]},
    "user_embeddings": {"subjects": [0.1, 0.2, 0.3]},
    "recommended_programs": [{"name": "Computer Science"}],
    "feedback_type": "positive",
    "feedback_details": "Great recommendations!",
    "selected_program": null,
    "timestamp": "2024-01-01T12:00:00"
  }'
```

#### Test Stats Endpoint
```bash
curl http://127.0.0.1:8000/feedback/stats
```

#### Test Retraining Endpoint
```bash
curl -X POST http://127.0.0.1:8000/model/retrain \
  -H "Content-Type: application/json" \
  -d '{"force_retrain": false, "min_feedback_count": 10}'
```

### Database Testing
Check MongoDB collections:

```javascript
// Connect to MongoDB and run:
use your_database_name

// Check feedback collection
db.user_feedback.find().pretty()

// Check feedback statistics
db.user_feedback.aggregate([
  {
    $group: {
      _id: "$feedback_type",
      count: { $sum: 1 }
    }
  }
])

// Check recent feedback
db.user_feedback.find({
  timestamp: {
    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }
}).count()
```

## 📊 Performance Testing

### Load Testing
Test with multiple concurrent users:

```python
import threading
import requests
import time

def simulate_user():
    # Run search and submit feedback
    pass

# Create multiple threads
threads = []
for i in range(10):
    thread = threading.Thread(target=simulate_user)
    threads.append(thread)
    thread.start()

# Wait for all threads
for thread in threads:
    thread.join()
```

### Memory Testing
Monitor memory usage during retraining:
- Check memory consumption during model training
- Verify model files are saved correctly
- Test with large feedback datasets

## 🐛 Troubleshooting

### Common Issues

#### 1. Feedback Not Storing
**Symptoms**: Feedback submission fails, no data in MongoDB
**Solutions**:
- Check MongoDB connection
- Verify API endpoint is running
- Check request format and required fields

#### 2. Retraining Fails
**Symptoms**: Model retraining returns error
**Solutions**:
- Ensure sufficient feedback data (50+ samples)
- Check scikit-learn installation
- Verify file permissions for model saving

#### 3. No Improvement in Recommendations
**Symptoms**: Recommendations don't change after retraining
**Solutions**:
- Check feedback diversity (need mix of positive/negative)
- Verify model files are being updated
- Check FEEDBACK_WEIGHT parameter

#### 4. Admin Dashboard Not Loading
**Symptoms**: Dashboard shows loading indefinitely
**Solutions**:
- Check backend API endpoints
- Verify CORS settings
- Check browser console for errors

### Debug Mode
Enable debug logging in `recommendation.py`:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📈 Success Metrics

### Quantitative Metrics
- **Feedback Response Rate**: > 20% of users submit feedback
- **Model Improvement**: > 5% improvement in user satisfaction
- **Training Time**: < 30 seconds for 1000 feedback samples
- **System Uptime**: > 99% availability

### Qualitative Metrics
- User feedback quality and relevance
- Recommendation accuracy improvement
- System responsiveness and user experience

## 🔄 Continuous Testing

### Automated Testing Schedule
1. **Daily**: Run `test_feedback.py` to verify system functionality
2. **Weekly**: Test with new feedback patterns
3. **Monthly**: Performance testing with larger datasets

### Monitoring Checklist
- [ ] Feedback collection rate
- [ ] Model retraining success rate
- [ ] Recommendation quality metrics
- [ ] System performance indicators
- [ ] User satisfaction scores

## 📝 Test Report Template

After testing, document your results:

```markdown
# Test Report - [Date]

## Test Environment
- Backend: [Version]
- Frontend: [Version]
- Database: [Version]

## Test Results
- Total feedback samples: [Number]
- Retraining success: [Yes/No]
- Improvement score: [Percentage]
- Issues found: [List]

## Recommendations
- [Action items for improvement]
- [Next testing priorities]
```

## 🎯 Next Steps

1. **Run the automated test script** to verify basic functionality
2. **Perform manual testing** to understand user experience
3. **Monitor the admin dashboard** to track system performance
4. **Collect real user feedback** to improve the model
5. **Iterate and improve** based on testing results

---

**Need Help?** Check the `README_FEEDBACK.md` file for detailed technical documentation, or review the code comments in `recommendation.py` for implementation details. 