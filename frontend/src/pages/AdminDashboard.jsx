import { useState, useEffect } from "react";
import { BarChart3, RefreshCw, TrendingUp, Users, MessageSquare } from "lucide-react";
import Navbar from "../components/Navbar";

function AdminDashboard() {
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [retrainResult, setRetrainResult] = useState(null);

  useEffect(() => {
    fetchFeedbackStats();
  }, []);

  const fetchFeedbackStats = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/feedback/stats");
      if (response.ok) {
        const data = await response.json();
        setFeedbackStats(data);
      }
    } catch (error) {
      console.error("Error fetching feedback stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const triggerModelRetraining = async () => {
    setRetraining(true);
    setRetrainResult(null);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/model/retrain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          force_retrain: false,
          min_feedback_count: 50
        }),
      });

      const result = await response.json();
      setRetrainResult(result);
      
      // Refresh stats after retraining
      if (result.success) {
        setTimeout(fetchFeedbackStats, 1000);
      }
    } catch (error) {
      console.error("Error triggering model retraining:", error);
      setRetrainResult({ error: "Failed to trigger retraining" });
    } finally {
      setRetraining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="max-w-6xl mx-auto py-10 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading feedback statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor feedback and manage model learning</p>
        </div>

        {/* Feedback Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                <p className="text-2xl font-bold text-blue-600">
                  {feedbackStats?.total_feedback || 0}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent (7 days)</p>
                <p className="text-2xl font-bold text-green-600">
                  {feedbackStats?.recent_feedback_7_days || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready for Retraining</p>
                <p className="text-2xl font-bold text-orange-600">
                  {feedbackStats?.ready_for_retraining ? "Yes" : "No"}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Model Status</p>
                <p className="text-2xl font-bold text-purple-600">
                  {feedbackStats?.total_feedback >= 50 ? "Trained" : "Training"}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Feedback Distribution */}
        {feedbackStats?.feedback_distribution && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Feedback Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {feedbackStats.feedback_distribution.map((item, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 capitalize">
                    {item._id.replace("_", " ")}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">{item.count}</p>
                  <p className="text-xs text-gray-500">
                    {((item.count / feedbackStats.total_feedback) * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Model Retraining */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Model Management</h2>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">
                Current feedback count: <span className="font-semibold">{feedbackStats?.total_feedback || 0}</span>
              </p>
              <p className="text-sm text-gray-600">
                Minimum required: <span className="font-semibold">50</span>
              </p>
            </div>
            
            <button
              onClick={triggerModelRetraining}
              disabled={retraining || (feedbackStats?.total_feedback || 0) < 50}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              {retraining ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Retraining...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Retrain Model
                </>
              )}
            </button>
          </div>

          {retrainResult && (
            <div className={`p-4 rounded-lg border ${
              retrainResult.success 
                ? "bg-green-50 border-green-200 text-green-800" 
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              <h3 className="font-semibold mb-2">
                {retrainResult.success ? "Retraining Completed" : "Retraining Failed"}
              </h3>
              <p className="text-sm">{retrainResult.message}</p>
              {retrainResult.feedback_used && (
                <p className="text-sm mt-1">Feedback samples used: {retrainResult.feedback_used}</p>
              )}
              {retrainResult.training_time && (
                <p className="text-sm mt-1">Training time: {retrainResult.training_time.toFixed(2)}s</p>
              )}
              {retrainResult.improvement_score && (
                <p className="text-sm mt-1">Improvement score: {(retrainResult.improvement_score * 100).toFixed(1)}%</p>
              )}
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            <p>💡 The model automatically learns from user feedback to improve recommendations.</p>
            <p>📊 Retraining requires at least 50 feedback samples for optimal results.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 