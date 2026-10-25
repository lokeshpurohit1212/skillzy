import React, { useState, useEffect } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Sparkles,
  CheckCircle,
  Circle,
  Plus,
  BookOpen,
  RefreshCw
} from 'lucide-react';

const Copilot = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('roadmaps'); // 'roadmaps' | 'prep'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Form state for new roadmap
  const [form, setForm] = useState({
    skillName: '',
    currentProficiency: 'Beginner',
    targetProficiency: 'Advanced',
    weeklyCommitmentHours: 5,
    learningStyle: 'hands-on'
  });

  // Session Prep state
  const [prepSkill, setPrepSkill] = useState('');
  const [prepDuration, setPrepDuration] = useState(60);
  const [prepResult, setPrepResult] = useState(null);
  const [generatingPrep, setGeneratingPrep] = useState(false);

  useEffect(() => {
    fetchRoadmaps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const res = await api.get('/copilot/roadmaps');
      setRoadmaps(res.data || []);
      if (res.data?.length > 0 && !selectedRoadmap) {
        setSelectedRoadmap(res.data[0]);
      }
    } catch (err) {
      toast.error('Failed to load learning roadmaps');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoadmap = async (e) => {
    e.preventDefault();
    if (!form.skillName.trim()) {
      toast.error('Please enter a skill to learn');
      return;
    }

    setGenerating(true);
    try {
      const res = await api.post('/copilot/roadmap', form);
      toast.success('AI Learning Roadmap generated successfully! (+20 XP)');
      setRoadmaps([res.data.roadmap, ...roadmaps]);
      setSelectedRoadmap(res.data.roadmap);
      setShowCreateModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const toggleMilestone = async (roadmapId, milestoneId, currentStatus) => {
    try {
      const res = await api.put(`/copilot/roadmaps/${roadmapId}/milestone/${milestoneId}`, {
        completed: !currentStatus
      });

      if (!currentStatus) {
        toast.success('Milestone completed! +35 XP earned 🎉');
      }

      // Update local state
      const updated = res.data.roadmap;
      setRoadmaps(roadmaps.map(r => (r._id === updated._id ? updated : r)));
      if (selectedRoadmap?._id === updated._id) {
        setSelectedRoadmap(updated);
      }
    } catch (err) {
      toast.error('Failed to update milestone');
    }
  };

  const handleGeneratePrep = async (e) => {
    e.preventDefault();
    if (!prepSkill.trim()) {
      toast.error('Please enter a skill topic');
      return;
    }

    setGeneratingPrep(true);
    try {
      const res = await api.post('/copilot/session-prep', {
        skillTopic: prepSkill,
        durationMinutes: parseInt(prepDuration, 10)
      });
      setPrepResult(res.data);
      toast.success('Session preparation agenda generated!');
    } catch (err) {
      toast.error('Failed to generate session prep');
    } finally {
      setGeneratingPrep(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0D15] text-gray-900 dark:text-[#F5F2FA] pt-20 pb-16 px-4 sm:px-6 lg:px-8 animate-fade-in transition-colors duration-200">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Top Banner */}
        <div className="bg-white dark:bg-[#1A1625] rounded-3xl p-6 sm:p-8 shadow-sm border border-purple-100 dark:border-[#2D263B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/40 px-3 py-1 rounded-full text-[#5D3C64] dark:text-purple-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-orchid dark:text-purple-400" />
              <span>AI Learning Copilot</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-brand-plum dark:text-[#F5F2FA] tracking-tight mb-2">
              Personalized Roadmaps & Session Preparation
            </h1>
            <p className="text-brand-orchid dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              Generate milestone-driven study roadmaps, recommended exercises, and structured live session agendas tailored to your goals.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#5D3C64] hover:bg-[#4A2F4F] dark:bg-[#A78BFA] dark:hover:bg-[#906cd8] text-white dark:text-gray-950 rounded-xl text-sm font-semibold shadow-md transition flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Roadmap</span>
          </button>
        </div>

        {/* Main Tabs */}
        <div className="flex border-b border-gray-200 dark:border-[#2D263B] pb-2 space-x-4">
          <button
            onClick={() => setActiveTab('roadmaps')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'roadmaps'
                ? 'bg-[#5D3C64] dark:bg-[#A78BFA] text-white dark:text-gray-950 shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-[#F5F2FA] hover:bg-gray-100 dark:hover:bg-[#262035]'
            }`}
          >
            My Learning Roadmaps ({roadmaps.length})
          </button>
          <button
            onClick={() => setActiveTab('prep')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'prep'
                ? 'bg-[#5D3C64] dark:bg-[#A78BFA] text-white dark:text-gray-950 shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-[#F5F2FA] hover:bg-gray-100 dark:hover:bg-[#262035]'
            }`}
          >
            Session Preparation Generator
          </button>
        </div>

        {/* Roadmaps Tab Content */}
        {activeTab === 'roadmaps' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-brand-plum dark:text-[#F5F2FA]">Active Roadmaps</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-[#5D3C64] hover:bg-[#4A2F4F] dark:bg-[#A78BFA] dark:hover:bg-[#906cd8] text-white dark:text-gray-950 rounded-xl text-xs font-bold shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Roadmap</span>
              </button>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : roadmaps.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#1A1625] rounded-3xl border border-dashed border-gray-200 dark:border-[#2D263B] p-8 shadow-xs">
                <BookOpen className="w-12 h-12 text-brand-orchid dark:text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-brand-plum dark:text-[#F5F2FA] mb-1">No Learning Roadmaps Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-6">
                  Tell our AI what skill you want to master, and get a structured milestone plan with practice exercises.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-5 py-2.5 bg-[#5D3C64] hover:bg-[#4A2F4F] dark:bg-[#A78BFA] dark:hover:bg-[#906cd8] text-white dark:text-gray-950 rounded-xl text-sm font-semibold transition shadow-sm"
                >
                  Generate Your First Roadmap
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Roadmap Selector */}
                <div className="space-y-3">
                  {roadmaps.map((r) => (
                    <div
                      key={r._id}
                      onClick={() => setSelectedRoadmap(r)}
                      className={`p-4 rounded-2xl border cursor-pointer transition ${
                        selectedRoadmap?._id === r._id
                          ? 'bg-purple-50/60 dark:bg-[#262035] border-purple-300 dark:border-purple-500/60 shadow-sm'
                          : 'bg-white dark:bg-[#1A1625] border-purple-100 dark:border-[#2D263B] hover:border-purple-200 dark:hover:border-purple-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900 dark:text-[#F5F2FA] text-sm">{r.skillName}</h4>
                        <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-900/50 text-[#5D3C64] dark:text-purple-300 px-2 py-0.5 rounded-full">
                          {r.progressPercentage}%
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 dark:bg-[#2D263B] h-1.5 rounded-full overflow-hidden mb-2">
                        <div
                          className="bg-[#5D3C64] dark:bg-[#A78BFA] h-full rounded-full transition-all duration-300"
                          style={{ width: `${r.progressPercentage}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                        <span>{r.currentProficiency} → {r.targetProficiency}</span>
                        <span>{r.milestones?.length || 0} Milestones</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column: Detailed Milestones Checklist */}
                {selectedRoadmap && (
                  <div className="lg:col-span-2 bg-white dark:bg-[#1A1625] rounded-3xl border border-purple-100 dark:border-[#2D263B] p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-[#2D263B] pb-5 mb-6">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-2xl font-black text-brand-plum dark:text-[#F5F2FA]">{selectedRoadmap.skillName}</h3>
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-[#5D3C64] dark:text-purple-300 font-bold px-2 py-0.5 rounded-full">
                          {selectedRoadmap.targetProficiency} Goal
                        </span>
                      </div>
                      <p className="text-xs text-brand-orchid dark:text-purple-300 mt-1">
                        Commitment: {selectedRoadmap.weeklyCommitmentHours} hrs/week • Learning Style: {selectedRoadmap.learningStyle}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-[#5D3C64] dark:text-[#A78BFA]">{selectedRoadmap.progressPercentage}%</div>
                      <div className="text-[11px] font-bold uppercase text-gray-400 dark:text-gray-400">Completed</div>
                    </div>
                  </div>

                  {/* Milestones List */}
                  <div className="space-y-6">
                    {selectedRoadmap.milestones.map((milestone, idx) => (
                      <div
                        key={milestone.id || idx}
                        className={`p-5 rounded-2xl border transition ${
                          milestone.completed
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-gray-50/50 dark:bg-[#262035]/50 border-gray-200 dark:border-[#2D263B]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-start space-x-3">
                            <button
                              onClick={() => toggleMilestone(selectedRoadmap._id, milestone.id, milestone.completed)}
                              className="mt-0.5 text-[#5D3C64] dark:text-purple-300 hover:scale-110 transition flex-shrink-0"
                            >
                              {milestone.completed ? (
                                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                              ) : (
                                <Circle className="w-6 h-6 text-gray-400 dark:text-gray-500 hover:text-[#5D3C64] dark:hover:text-[#A78BFA]" />
                              )}
                            </button>
                            <div>
                              <h4 className={`text-base font-bold ${milestone.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-[#F5F2FA]'}`}>
                                Milestone {idx + 1}: {milestone.title}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{milestone.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Exercises & Topics */}
                        <div className="ml-9 mt-3 space-y-2 border-t border-gray-200/50 dark:border-[#2D263B] pt-3">
                          {milestone.practiceExercises?.length > 0 && (
                            <div>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 block mb-1">
                                Recommended Practice Tasks:
                              </span>
                              <ul className="space-y-1">
                                {milestone.practiceExercises.map((ex, eIdx) => (
                                  <li key={eIdx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start space-x-1.5">
                                    <span className="text-[#5D3C64] dark:text-[#A78BFA] font-bold">•</span>
                                    <span>{ex}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {milestone.suggestedSessionTopics?.length > 0 && (
                            <div className="mt-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 block mb-1">
                                Partner Exchange Agenda Topics:
                              </span>
                              <ul className="space-y-1">
                                {milestone.suggestedSessionTopics.map((topic, tIdx) => (
                                  <li key={tIdx} className="text-xs text-brand-orchid dark:text-purple-300 flex items-start space-x-1.5">
                                    <span className="text-[#5D3C64] dark:text-[#A78BFA] font-bold">→</span>
                                    <span>{topic}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Session Prep Tab Content */}
      {activeTab === 'prep' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-[#1A1625] rounded-3xl border border-purple-100 dark:border-[#2D263B] p-6 shadow-sm">
            <h3 className="text-lg font-bold text-brand-plum dark:text-[#F5F2FA] mb-2">Generate Session Prep</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Enter any skill or upcoming session topic to generate a time-boxed agenda and practical discussion tasks.
            </p>

            <form onSubmit={handleGeneratePrep} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Skill Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js Routing, Spanish Grammar, Figma Auto-Layout"
                  value={prepSkill}
                  onChange={(e) => setPrepSkill(e.target.value)}
                  className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 dark:focus:ring-purple-400/20 focus:border-[#5D3C64] dark:focus:border-[#A78BFA] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Session Duration</label>
                <select
                  value={prepDuration}
                  onChange={(e) => setPrepDuration(e.target.value)}
                  className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 dark:focus:ring-purple-400/20 focus:border-[#5D3C64] dark:focus:border-[#A78BFA] focus:outline-none"
                >
                  <option value="30" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">30 minutes</option>
                  <option value="45" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">45 minutes</option>
                  <option value="60" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">60 minutes</option>
                  <option value="90" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">90 minutes</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={generatingPrep}
                className="w-full py-3 bg-[#5D3C64] hover:bg-[#4A2F4F] dark:bg-[#A78BFA] dark:hover:bg-[#906cd8] text-white dark:text-gray-950 rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {generatingPrep ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Agenda...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Prep Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-[#1A1625] rounded-3xl border border-purple-100 dark:border-[#2D263B] p-6 shadow-sm">
            {!prepResult ? (
              <div className="text-center py-16 text-brand-orchid dark:text-purple-300">
                <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50 text-brand-orchid dark:text-purple-400" />
                <p className="text-sm">Enter a topic on the left to view your AI session agenda and exercises.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-black text-brand-plum dark:text-[#F5F2FA] mb-1">{prepSkill} Session Plan</h4>
                  <p className="text-xs text-[#5D3C64] dark:text-purple-300 font-semibold">
                    Generated via {prepResult.generatedBy === 'ai_gemini' ? 'Google Gemini AI' : 'Deterministic Learning Engine'}
                  </p>
                </div>

                {/* Agenda */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-3">Structured Time-Boxed Agenda</h5>
                  <div className="space-y-2">
                    {prepResult.agenda?.map((step, sIdx) => (
                      <div key={sIdx} className="p-3 rounded-xl bg-purple-50/40 dark:bg-[#262035]/60 border border-purple-100 dark:border-[#2D263B]">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-900 dark:text-[#F5F2FA] mb-1">
                          <span>{step.topic}</span>
                          <span className="text-[10px] bg-purple-100 dark:bg-purple-900/50 text-[#5D3C64] dark:text-purple-300 px-2 py-0.5 rounded font-semibold">
                            {step.duration}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Questions */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2">Discussion Questions</h5>
                  <ul className="space-y-1.5">
                    {prepResult.discussionQuestions?.map((q, qIdx) => (
                      <li key={qIdx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                        <span className="text-[#5D3C64] dark:text-[#A78BFA] font-bold">?</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exercises */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-2">Practice Tasks</h5>
                  <ul className="space-y-1.5">
                    {prepResult.exercises?.map((ex, exIdx) => (
                      <li key={exIdx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                        <span className="text-emerald-500 dark:text-emerald-400 font-bold">✓</span>
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Roadmap Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1625] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-purple-100 dark:border-[#2D263B]">
            <h2 className="text-xl font-bold text-brand-plum dark:text-[#F5F2FA] mb-1">Generate AI Learning Roadmap</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Enter your target skill and timeline to build a customized milestone path.
            </p>

            <form onSubmit={handleCreateRoadmap} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Skill to Learn</label>
                <input
                  type="text"
                  placeholder="e.g. Full-Stack Python, React, UI/UX, Guitar..."
                  value={form.skillName}
                  onChange={(e) => setForm({ ...form, skillName: e.target.value })}
                  className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 dark:focus:ring-purple-400/20 focus:border-[#5D3C64] dark:focus:border-[#A78BFA] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Current Level</label>
                  <select
                    value={form.currentProficiency}
                    onChange={(e) => setForm({ ...form, currentProficiency: e.target.value })}
                    className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 dark:focus:ring-purple-400/20 focus:border-[#5D3C64] dark:focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="Beginner" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">Beginner</option>
                    <option value="Intermediate" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">Intermediate</option>
                    <option value="Advanced" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Target Level</label>
                  <select
                    value={form.targetProficiency}
                    onChange={(e) => setForm({ ...form, targetProficiency: e.target.value })}
                    className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 dark:focus:ring-purple-400/20 focus:border-[#5D3C64] dark:focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="Intermediate" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">Intermediate</option>
                    <option value="Advanced" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">Advanced</option>
                    <option value="Expert" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">Expert</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Weekly Commitment</label>
                  <select
                    value={form.weeklyCommitmentHours}
                    onChange={(e) => setForm({ ...form, weeklyCommitmentHours: parseInt(e.target.value, 10) })}
                    className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 dark:focus:ring-purple-400/20 focus:border-[#5D3C64] dark:focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="3" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">3 hours / week</option>
                    <option value="5" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">5 hours / week</option>
                    <option value="10" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">10 hours / week</option>
                    <option value="15" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">15 hours / week</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Learning Style</label>
                  <select
                    value={form.learningStyle}
                    onChange={(e) => setForm({ ...form, learningStyle: e.target.value })}
                    className="w-full border border-gray-300 dark:border-[#2D263B] bg-white dark:bg-[#151221] text-gray-900 dark:text-[#F5F2FA] rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#5D3C64]/20 dark:focus:ring-purple-400/20 focus:border-[#5D3C64] dark:focus:border-[#A78BFA] focus:outline-none"
                  >
                    <option value="hands-on" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">Hands-on Projects</option>
                    <option value="visual" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">Visual & Concepts</option>
                    <option value="interactive" className="dark:bg-[#1A1625] dark:text-[#F5F2FA]">Pair Practice</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-[#2D263B]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#262035] dark:hover:text-[#F5F2FA] rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2 bg-[#5D3C64] hover:bg-[#4A2F4F] dark:bg-[#A78BFA] dark:hover:bg-[#906cd8] text-white dark:text-gray-950 rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <span>Create Roadmap</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Copilot;
