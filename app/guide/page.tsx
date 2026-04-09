"use client";

export default function GuidePage() {
  return (
    <div className="min-h-screen" style={{ background: "#fff", color: "#0f0f0f" }}>
      {/* Print-friendly styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          body { background: white !important; }
        }
        .guide-box {
          border: 2px solid #ff0000;
          border-radius: 12px;
          padding: 16px 20px;
          margin: 12px 0;
          background: #fff5f5;
        }
        .guide-arrow {
          display: inline-block;
          color: #ff0000;
          font-weight: bold;
          font-size: 18px;
          margin-right: 8px;
        }
        .step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ff0000;
          color: white;
          font-weight: bold;
          font-size: 16px;
          margin-right: 12px;
          flex-shrink: 0;
        }
        .section-title {
          font-size: 24px;
          font-weight: 700;
          color: #ff0000;
          margin: 32px 0 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #ff0000;
        }
        .feature-card {
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 20px;
          margin: 12px 0;
          background: #fafafa;
        }
        .hotkey {
          display: inline-block;
          background: #0f0f0f;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
        }
      `}</style>

      {/* Download button */}
      <div className="no-print sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <a href="/" className="text-sm text-gray-500 hover:text-red-600">← Back to Simulator</a>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          Download as PDF
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Cover */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-600 mb-6">
            <span className="text-3xl font-bold text-white">S</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Synergy Sales Training Simulator</h1>
          <p className="text-lg text-gray-500 mt-3">User Guide & Instruction Manual</p>
          <p className="text-sm text-gray-400 mt-2">Synergy Lubricant & Chemical Co., Ltd.</p>
        </div>

        {/* Table of Contents */}
        <div className="feature-card">
          <h2 className="text-lg font-bold mb-3">Table of Contents</h2>
          <ol className="space-y-1.5 text-sm text-gray-700">
            <li>1. Getting Started — Login & Registration</li>
            <li>2. Dashboard Overview — Navigation & Layout</li>
            <li>3. Training Modes — Prospect Sim, Watch AI Sell, Coach</li>
            <li>4. Voice Calling — Live AI Conversations</li>
            <li>5. Quick Action Buttons — Pre-built Sales Lines</li>
            <li>6. Session Reports — Scores & Feedback</li>
            <li>7. Call Logs — Review Past Conversations</li>
            <li>8. Progress & Achievements — Levels, Badges, Streaks</li>
            <li>9. Leaderboard — Compete with Your Team</li>
            <li>10. Dark/Light Mode — Theme Settings</li>
            <li>11. Admin Panel — User Management (Admins Only)</li>
          </ol>
        </div>

        {/* Section 1: Login */}
        <h2 className="section-title">1. Getting Started</h2>

        <div className="guide-box">
          <div className="flex items-start">
            <span className="step-number">1</span>
            <div>
              <strong>Open the app</strong> — Go to the simulator URL in Chrome or Edge.
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> You will see the login screen with the Synergy logo.
              </p>
            </div>
          </div>
        </div>

        <div className="guide-box">
          <div className="flex items-start">
            <span className="step-number">2</span>
            <div>
              <strong>Create an account</strong> — Click "New here? Create an account" at the bottom.
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> Enter your name, email, and a password (min 6 characters).
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> Each person creates their own account. Your progress, scores, and call logs are saved to YOUR account.
              </p>
            </div>
          </div>
        </div>

        <div className="guide-box">
          <div className="flex items-start">
            <span className="step-number">3</span>
            <div>
              <strong>Sign in</strong> — Enter your email and password, then click "Sign In".
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> You will be taken to the Training dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Dashboard */}
        <h2 className="section-title page-break">2. Dashboard Overview</h2>

        <div className="feature-card">
          <p className="text-sm text-gray-700 mb-4">After logging in, you will see the main dashboard with these areas:</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="guide-arrow">1.</span>
              <div><strong>Header Bar (top)</strong> — Shows your name, level, points, and the theme toggle (sun/moon icon).</div>
            </div>
            <div className="flex items-start gap-3">
              <span className="guide-arrow">2.</span>
              <div><strong>Navigation Tabs</strong> — Training, Call Logs, Progress, Board, Admin (admin only).</div>
            </div>
            <div className="flex items-start gap-3">
              <span className="guide-arrow">3.</span>
              <div><strong>Setup Sidebar (left)</strong> — Choose your Training Mode, Target Market, and Objection.</div>
            </div>
            <div className="flex items-start gap-3">
              <span className="guide-arrow">4.</span>
              <div><strong>Chat Panel (right)</strong> — The main conversation area where you practice selling.</div>
            </div>
          </div>
        </div>

        {/* Section 3: Training Modes */}
        <h2 className="section-title">3. Training Modes</h2>

        <div className="guide-box">
          <div className="flex items-start">
            <span className="step-number">A</span>
            <div>
              <strong>Prospect Simulator</strong> — YOU are the salesperson. The AI plays a tough prospect.
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> Click the "Prospect Sim" button in the sidebar.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> Select a market (Philippines, Vietnam, India, Myanmar).
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> Optionally pick an objection to practice against.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> Type your opening line or use the Quick Action buttons.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> The score pills at the top track: Objection Handled, Prospect Qualified, White-Label Pitched, Visit Close Made.
              </p>
            </div>
          </div>
        </div>

        <div className="guide-box">
          <div className="flex items-start">
            <span className="step-number">B</span>
            <div>
              <strong>Watch AI Sell</strong> — The AI demonstrates perfect Hormozi-style selling. YOU play the prospect.
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> Click "Watch AI Sell" in the sidebar.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> Select a market. Throw objections at the AI and watch how it handles them.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> Each AI response includes a TIP explaining the technique used.
              </p>
            </div>
          </div>
        </div>

        <div className="guide-box">
          <div className="flex items-start">
            <span className="step-number">C</span>
            <div>
              <strong>Coach Mode</strong> — Get scored and coached on your sales approach.
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> Click "Coach Mode" in the sidebar.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> No market needed. Describe your call or paste a transcript.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> The coach gives scores (Opening, Qualification, Objection, Close out of 10) and word-for-word replacement scripts.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Voice Calling */}
        <h2 className="section-title page-break">4. Voice Calling</h2>

        <div className="guide-box">
          <div className="flex items-start">
            <span className="step-number">1</span>
            <div>
              <strong>Start a voice call</strong> — Click the green "Call" button in the chat header.
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> A full-screen call overlay will appear.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> Allow microphone access when prompted by your browser.
              </p>
            </div>
          </div>
        </div>

        <div className="guide-box">
          <div className="flex items-start">
            <span className="step-number">2</span>
            <div>
              <strong>During the call</strong> — Speak naturally, like a real phone call.
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> The AI persona will greet you first.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> The status ring shows: green = listening, blue = AI speaking.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> A transcript appears at the bottom showing what was said.
              </p>
            </div>
          </div>
        </div>

        <div className="guide-box">
          <div className="flex items-start">
            <span className="step-number">3</span>
            <div>
              <strong>End the call</strong> — Click the red phone button to hang up.
              <p className="text-sm text-gray-600 mt-1">
                <span className="guide-arrow">→</span> A performance report will be generated automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Quick Actions */}
        <h2 className="section-title">5. Quick Action Buttons</h2>

        <div className="feature-card">
          <p className="text-sm text-gray-700 mb-3">Below the chat area, you will see pre-built sales lines. Click any button to instantly send that line:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><strong>Open</strong> — Professional opening line</div>
            <div><strong>Qualify</strong> — Volume & decision-maker questions</div>
            <div><strong>White-Label</strong> — Pitch custom branding</div>
            <div><strong>Close</strong> — In-person visit offer</div>
            <div><strong>Price</strong> — Handle price objections</div>
            <div><strong>Certs</strong> — API certification pitch</div>
          </div>
        </div>

        {/* Section 6: Reports */}
        <h2 className="section-title">6. Session Reports</h2>

        <div className="feature-card">
          <p className="text-sm text-gray-700 mb-3">Click "End" in the chat header to generate your performance report:</p>
          <div className="space-y-2 text-sm text-gray-700">
            <div><span className="guide-arrow">→</span> <strong>Score (0-100)</strong> — Overall performance rating.</div>
            <div><span className="guide-arrow">→</span> <strong>Pills</strong> — Did you handle objections? Qualify? Pitch white-label? Close with a visit?</div>
            <div><span className="guide-arrow">→</span> <strong>Done Well</strong> — Specific things you did right.</div>
            <div><span className="guide-arrow">→</span> <strong>To Improve</strong> — What went wrong with exact replacement scripts.</div>
            <div><span className="guide-arrow">→</span> <strong>Next Session</strong> — Recommended scenario to practice next.</div>
          </div>
        </div>

        {/* Section 7-11: Brief sections */}
        <h2 className="section-title page-break">7. Call Logs</h2>
        <div className="feature-card">
          <p className="text-sm text-gray-700">Click the "Call Logs" tab to see all your past sessions. Click any entry to view the full transcript. Each log shows: persona name, duration, score, and message count.</p>
        </div>

        <h2 className="section-title">8. Progress & Achievements</h2>
        <div className="feature-card">
          <p className="text-sm text-gray-700 mb-2">Click "Progress" to see your stats:</p>
          <div className="space-y-1 text-sm text-gray-700">
            <div><span className="guide-arrow">→</span> <strong>Level system</strong> — Earn points from sessions. Level up from Rookie to Elite Closer.</div>
            <div><span className="guide-arrow">→</span> <strong>Badges</strong> — Unlock achievements like "First Blood", "On Fire" (3 sessions/day), "Market Explorer" (all markets).</div>
            <div><span className="guide-arrow">→</span> <strong>Streak</strong> — Practice daily to build your consecutive day streak.</div>
          </div>
        </div>

        <h2 className="section-title">9. Leaderboard</h2>
        <div className="feature-card">
          <p className="text-sm text-gray-700">Click "Board" to see how you rank against your team. Rankings are based on total points. The admin can reset the leaderboard weekly.</p>
        </div>

        <h2 className="section-title">10. Dark / Light Mode</h2>
        <div className="feature-card">
          <p className="text-sm text-gray-700">Click the sun/moon icon in the top-right header to switch between dark mode and light mode. Your preference is saved automatically.</p>
        </div>

        <h2 className="section-title">11. Admin Panel</h2>
        <div className="feature-card">
          <p className="text-sm text-gray-700 mb-2">Admin users see an extra "Admin" tab with:</p>
          <div className="space-y-1 text-sm text-gray-700">
            <div><span className="guide-arrow">→</span> <strong>Overview</strong> — Total users, sessions, average score, win rate.</div>
            <div><span className="guide-arrow">→</span> <strong>Sessions</strong> — View and filter all user sessions. Export to CSV.</div>
            <div><span className="guide-arrow">→</span> <strong>Manage</strong> — Set points, reset user progress, reset leaderboard.</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
          <p>Synergy Lubricant & Chemical Co., Ltd.</p>
          <p className="mt-1">Sales Training Simulator — User Guide v1.0</p>
        </div>
      </div>
    </div>
  );
}
