import { usePomodoroStore } from '../../../stores/pomodoroStore';
import './styles.css';

export function Countdown() {
  const minutes = usePomodoroStore((s) => s.minutes);
  const seconds = usePomodoroStore((s) => s.seconds);

  const [minutesLeft, minuteRight] = String(minutes).padStart(2, '0').split('');
  const [secondsLeft, secondsRight] = String(seconds).padStart(2, '0').split('');

  return (
    <article className={'countdownContainer'}>
        <div>
          <span>
            {minutesLeft}
          </span>
          <span>
            {minuteRight}
          </span>
        </div>
        
        <span>:</span>

        <div>
          <span>{secondsLeft}</span>
          <span>{secondsRight}</span>
        </div>
    </article>
  )
}