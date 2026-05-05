type Props = {
  hasExam: boolean;
  examdate: string | null;
  hideCountdown: boolean;
};

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exam = new Date(dateStr + 'T00:00:00');
  return Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function ExamCountdown({ hasExam, examdate, hideCountdown }: Props) {
  if (!hasExam || hideCountdown || !examdate) return null;

  const days = daysUntil(examdate);

  if (days < 0) return null;

  let colorClass: string;
  let urgency: string;
  if (days <= 14) {
    colorClass = 'bg-red-50 border-red-200 text-red-800';
    urgency = 'Soon';
  } else if (days <= 30) {
    colorClass = 'bg-amber-50 border-amber-200 text-amber-800';
    urgency = 'Coming up';
  } else {
    colorClass = 'bg-green-50 border-green-200 text-green-800';
    urgency = "You've got time";
  }

  const examFormatted = new Date(examdate + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className={`mx-8 mt-4 flex items-center gap-3 rounded-xl border px-5 py-3.5 ${colorClass}`}>
      <span className="text-2xl" aria-hidden="true">📅</span>
      <div className="flex-1">
        <p className="text-sm font-semibold">
          {days === 0
            ? 'Your exam is today!'
            : days === 1
            ? 'Your exam is tomorrow!'
            : `${days} days until your exam`}
        </p>
        <p className="text-xs opacity-75">{examFormatted} &mdash; {urgency}</p>
      </div>
    </div>
  );
}
