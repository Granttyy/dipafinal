import { useNavigate } from "react-router-dom";
import { Users, Search, GraduationCap } from "lucide-react";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";
import ShowcaseCarousel from "../components/ShowcaseCarousel";


function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your Perfect
              <span className="text-blue-600 block">Educational Path</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover the ideal school and program that matches your interests, budget, and location preferences with our
              intelligent recommendation system.
            </p>
            <button
              onClick={() => navigate("/unifinder")}
              className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
            >
              Start Finding Programs
            </button>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              How UniFinder Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Step 1 */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:border-blue-400 transition duration-300">
                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">1. Share Your Interests</h3>
                  <p className="text-gray-600">
                    Tell us about your passions, hobbies, and career interests to help us understand what you're looking for.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:border-green-400 transition duration-300">
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">2. Set Your Preferences</h3>
                  <p className="text-gray-600">
                    Choose between public or private institutions, set your budget range, and select your preferred locations.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:border-purple-400 transition duration-300">
                <div className="text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <GraduationCap className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">3. Get Recommendations</h3>
                  <p className="text-gray-600">
                    Receive personalized program and school recommendations that match your criteria perfectly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Showcase Carousel Section */}
        <ShowcaseCarousel />

        {/* FAQ Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {[
                {
                  question: "What is UniFinder?",
                  answer:
                    "UniFinder is a smart recommendation platform that helps students discover ideal programs and schools based on their preferences like interests, location, and budget.",
                },
                {
                  question: "Is UniFinder free to use?",
                  answer: "Yes! UniFinder is completely free for students to explore and use.",
                },
                {
                  question: "How accurate are the recommendations?",
                  answer:
                    "Our recommendations are generated using smart filters and similarity matching to align with the data you provide. The more accurate your input, the better the results.",
                },
                {
                  question: "Can I use UniFinder without creating an account?",
                  answer:
                    "Yes. You can try UniFinder without an account, but creating one lets you save your preferences and get better suggestions.",
                },
              ].map((faq, index) => (
                <details
                  key={index}
                  className="group border border-gray-200 rounded-xl p-4 open:bg-blue-50 transition-all duration-200"
                >
                  <summary className="font-semibold text-lg cursor-pointer text-gray-800 group-open:text-blue-600 flex justify-between items-center">
                    {faq.question}
                    <span className="ml-2 transform transition-transform group-open:rotate-180">
                      ⌄
                    </span>
                  </summary>
                  <p className="mt-2 text-gray-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>
      

      <Footer />
    </>
  );
}

export default Home;
