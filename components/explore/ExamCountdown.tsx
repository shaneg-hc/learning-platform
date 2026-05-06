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

  let dotClass: string;
  if (days <= 14) {
    dotClass = 'bg-red-500';
  } else if (days <= 30) {
    dotClass = 'bg-amber-400';
  } else {
    dotClass = 'bg-green-400';
  }

  const examFormatted = new Date(examdate + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const tooltip =
    days === 0 ? `Exam today — ${examFormatted}` :
    days === 1 ? `Exam tomorrow — ${examFormatted}` :
    `${days} days until your exam — ${examFormatted}`;

  return (
    <span
      title={tooltip}
      aria-label={tooltip}
      className="relative inline-flex cursor-default rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors items-center gap-2"
    >
      <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      Exam
    </span>
  );
}
