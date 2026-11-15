import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, MapPin, Trash2 } from 'lucide-react';
import { useCrm } from '../context/CrmContext';
import { Meeting } from '../types/crm';
import { Modal } from '../components/common/Modal';

export const CalendarPage: React.FC = () => {
  const { dataset, addMeeting, deleteMeeting, currentUser } = useCrm();
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDay, setSelectedDay] = useState(18); // May 18, 2025
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const [title, setTitle] = useState('');
  const [accountId, setAccountId] = useState(dataset.accounts[0]?.id || '');
  const [date, setDate] = useState('2025-05-18');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [location, setLocation] = useState('Zoom Video Room');
  const [type, setType] = useState<Meeting['type']>('Demo');
  const [notes, setNotes] = useState('');

  // May 2025 starts on Thursday (index 4 in Sun-Sat) and has 31 days
  const daysInMay = 31;
  const startOffset = 4;

  const meetingsByDate = useMemo(() => {
    const map: Record<string, Meeting[]> = {};
    dataset.meetings.forEach((m) => {
      if (!map[m.date]) map[m.date] = [];
      map[m.date].push(m);
    });
    return map;
  }, [dataset.meetings]);

  const openScheduleForDay = (dayNum: number) => {
    const formatted = `2025-05-${String(dayNum).padStart(2, '0')}`;
    setDate(formatted);
    setTitle('');
    setNotes('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addMeeting({
      title: title.trim(),
      accountId,
      ownerId: currentUser.id,
      date,
      startTime,
      endTime,
      location: location.trim() || 'Zoom Video Room',
      type,
      attendees: [currentUser.name],
      notes: notes.trim(),
    });
    setModalOpen(false);
  };

  const selectedDateKey = `2025-05-${String(selectedDay).padStart(2, '0')}`;
  const dayMeetings = meetingsByDate[selectedDateKey] || [];
  const weekDays = Array.from({ length: 7 }, (_, i) => Math.min(31, Math.max(1, selectedDay - 3 + i)));

  const inputCls =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#0AA6AD] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Sales Calendar</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            May 2025 · {dataset.meetings.length} scheduled customer demos, discovery calls, and reviews
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center rounded-full bg-slate-200/70 p-1 dark:bg-slate-800">
            {(['month', 'week', 'day'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`relative rounded-full px-3.5 py-1 text-xs font-medium capitalize transition-colors ${
                  view === v
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {view === v && (
                  <motion.span
                    layoutId="calendar-view-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-white shadow-xs dark:bg-slate-700"
                  />
                )}
                <span className="relative z-10">{v}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => openScheduleForDay(selectedDay)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0AA6AD] px-4 py-2 text-xs font-semibold text-white hover:bg-[#088c92]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Month / Week / Day Content */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {view === 'day' ? `May ${selectedDay}, 2025` : 'May 2025'}
          </h2>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedDay((d) => Math.max(1, d - 1))}
              aria-label="Previous day"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedDay(18)}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              Today (May 18)
            </button>
            <button
              type="button"
              onClick={() => setSelectedDay((d) => Math.min(31, d + 1))}
              aria-label="Next day"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {view === 'month' && (
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div
                key={d}
                className="bg-slate-50 py-2 text-center text-[11px] font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-400"
              >
                {d}
              </div>
            ))}

            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`pad-${i}`} className="min-h-[96px] bg-slate-50/50 dark:bg-slate-950/40" />
            ))}

            {Array.from({ length: daysInMay }, (_, i) => {
              const day = i + 1;
              const dateKey = `2025-05-${String(day).padStart(2, '0')}`;
              const events = meetingsByDate[dateKey] || [];
              const isSelected = day === selectedDay;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[96px] cursor-pointer bg-white p-2 transition-colors hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/70 ${
                    isSelected ? 'ring-2 ring-inset ring-[#0AA6AD]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                        day === 18
                          ? 'bg-[#0AA6AD] text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {day}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openScheduleForDay(day);
                      }}
                      title="Add event"
                      className="text-slate-300 hover:text-[#0AA6AD]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-1.5 space-y-1">
                    {events.slice(0, 2).map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMeeting(ev);
                        }}
                        className="block w-full truncate rounded bg-[#0AA6AD]/12 px-1.5 py-0.5 text-left text-[10px] font-semibold text-[#087F86] hover:bg-[#0AA6AD]/20 dark:text-[#38D9DF]"
                      >
                        {ev.startTime} {ev.title}
                      </button>
                    ))}
                    {events.length > 2 && (
                      <span className="block text-[10px] text-slate-400">+{events.length - 2} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'week' && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
            {weekDays.map((day) => {
              const key = `2025-05-${String(day).padStart(2, '0')}`;
              const evs = meetingsByDate[key] || [];
              return (
                <div
                  key={day}
                  className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                >
                  <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">May {day}</span>
                    <button
                      type="button"
                      onClick={() => openScheduleForDay(day)}
                      className="text-[#0AA6AD] hover:underline text-[11px]"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {evs.length === 0 ? (
                      <p className="text-[11px] text-slate-400">No meetings</p>
                    ) : (
                      evs.map((ev) => (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => setSelectedMeeting(ev)}
                          className="w-full rounded-lg bg-[#0AA6AD]/10 p-2 text-left text-xs hover:bg-[#0AA6AD]/15"
                        >
                          <p className="font-mono text-[10px] font-semibold text-[#0AA6AD]">
                            {ev.startTime}–{ev.endTime}
                          </p>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {ev.title}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'day' && (
          <div className="space-y-3">
            {dayMeetings.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500">
                No meetings scheduled for May {selectedDay}, 2025.
              </p>
            ) : (
              dayMeetings.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedMeeting(ev)}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-[#0AA6AD] dark:border-slate-800"
                >
                  <div>
                    <p className="font-mono text-xs font-semibold text-[#0AA6AD]">
                      {ev.startTime} – {ev.endTime} · {ev.type}
                    </p>
                    <h3 className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                      {ev.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {ev.location}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected Meeting Detail Modal */}
      <Modal
        open={Boolean(selectedMeeting)}
        onClose={() => setSelectedMeeting(null)}
        title={selectedMeeting?.title || 'Meeting Details'}
        subtitle={
          selectedMeeting
            ? `${selectedMeeting.date} · ${selectedMeeting.startTime}–${selectedMeeting.endTime}`
            : undefined
        }
      >
        {selectedMeeting && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <div>
                <p className="text-slate-400">Type</p>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedMeeting.type}</p>
              </div>
              <div>
                <p className="text-slate-400">Location</p>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedMeeting.location}</p>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300">{selectedMeeting.notes}</p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  deleteMeeting(selectedMeeting.id);
                  setSelectedMeeting(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-[#FF6155] hover:bg-[#FF6155]/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Cancel Meeting</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Schedule Meeting Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Meeting">
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium">Title *</label>
            <input required className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Discovery Call — BrightWave Ltd." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Account</label>
              <select className={inputCls} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                {dataset.accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Type</label>
              <select className={inputCls} value={type} onChange={(e) => setType(e.target.value as Meeting['type'])}>
                <option value="Demo">Demo</option>
                <option value="Discovery">Discovery</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Internal">Internal</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Date</label>
              <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Location</label>
              <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Start Time</label>
              <input type="time" className={inputCls} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">End Time</label>
              <input type="time" className={inputCls} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Agenda / Notes</label>
            <textarea rows={2} className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium dark:border-slate-700">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-[#0AA6AD] px-4 py-2 text-xs font-semibold text-white hover:bg-[#088c92]">
              Save Meeting
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
