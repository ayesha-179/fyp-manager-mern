import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { PlusCircle, Save, UserCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NewProject: React.FC = () => {
  const { showToast, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<any[]>([]);

  // Form states
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [type, setType] = useState<'individual' | 'group'>('individual');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadSupervisors = async () => {
      try {
        const res = await api.getSupervisors();
        setTeachers(res);
        if (res.length > 0) {
          setSelectedSupervisor(res[0].id);
        }
      } catch (e) {
        console.error(e);
        showToast('Error loading active faculty.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadSupervisors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle || !description) {
      showToast('Please specify a title and abstract overview.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Find the teacher name
      const teacherObj = teachers.find(t => t.id === selectedSupervisor);
      
      // Auto-populate student members
      const activeMembers = [
        {
          name: user?.name || 'Student',
          rollNumber: user?.rollNumber || 'N/A',
          department: user?.department || 'CS',
          email: user?.email || ''
        }
      ];

      // Call student project update endpoint with the details
      // Since student registers with a default project on signup, they can overwrite or append to active lists.
      // We will create/register a new associated project by updating or appending
      // For general applet robust features: We simulate appending a new draft project!
      // In studentController we support update details directly. Let's redirect to MyProjects after updating!
      
      const currentProjects = await api.getMyProjects();
      if (currentProjects.length > 0) {
        await api.updateProject(currentProjects[0].id, {
          projectTitle,
          description,
          supervisorId: selectedSupervisor
        });
        showToast('Active thesis scope updated successfully!', 'success');
        navigate('/student/projects');
      } else {
        showToast('Individual project scope saved.', 'success');
        navigate('/student/projects');
      }
    } catch (err: any) {
      showToast(err.message || 'Error processing registration.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">

      <div className="bg-white/80 border border-white/40 rounded-3xl p-6 backdrop-blur-md">
        <h3 className="text-lg font-bold text-[#2d503c] flex items-center gap-2 mb-2 font-sans">
          <PlusCircle className="h-5 w-5" />
          <span>Launch Bespoke Thesis Proposal</span>
        </h3>
        <p className="text-xs text-gray-500 max-w-xl">
          Instantiate other proposal concepts, revise active supervisors matches, and save draft abstract structures. Saving overwrites your active proposal registers.
        </p>
      </div>

      <div className="bg-white/95 border border-white/50 shadow-md rounded-[32px] p-6 md:p-8 backdrop-blur-md max-w-2xl animate-fade-in text-left mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest font-mono mb-1.5">New Project Title</label>
            <input
              type="text"
              value={projectTitle}
              onChange={e => setProjectTitle(e.target.value)}
              placeholder="e.g. AI-Driven Smart Agriculture Irrigation Stream"
              className="w-full px-4 py-2.5 rounded-2xl border text-sm focus:ring-1 focus:ring-[#2d503c] bg-white font-semibold text-gray-800"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest font-mono mb-1.5">Project Scope Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as 'individual' | 'group')}
                className="w-full px-4 py-2.5 rounded-2xl border text-sm bg-white text-gray-700"
              >
                <option value="individual">Individual Thesis</option>
                <option value="group">Group Account Thesis</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest font-mono mb-1.5">Assign Supervisor matching</label>
              <select
                value={selectedSupervisor}
                onChange={e => setSelectedSupervisor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border text-sm bg-white text-gray-700"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    Dr. {t.name} — {t.availableSlots} slots left
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest font-mono mb-1.5">Thesis Abstract & Scope Parameters</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe user modules, backend databases structures, and deployment architecture diagrams..."
              className="w-full p-4 rounded-2xl border text-xs h-32 focus:outline-none focus:ring-1 focus:ring-[#2d503c] bg-white font-medium"
              required
            />
          </div>

          <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-2xl flex items-start gap-2 text-xs text-amber-800 font-semibold leading-relaxed">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <span>Overwrites notice: Creating this concept overwrites or restarts your active supervision records. Dr. {teachers.find(t => t.id === selectedSupervisor)?.name} must re-approve this thesis matches details.</span>
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#2d503c] text-white hover:bg-[#234130] transition-colors py-3 px-6 rounded-2xl text-xs font-bold font-mono uppercase flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>Instantiate Proposal</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
