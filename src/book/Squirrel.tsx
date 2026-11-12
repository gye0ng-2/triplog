import { useEffect, useState } from 'react';
import eyesOpen from '../assets/daram1.png';
import eyesClosed from '../assets/daram2.png';

const random = (min: number, max: number) => min + Math.random() * (max - min);

export default function Squirrel({ size = 64, talking = false }: { size?: number; talking?: boolean }) {
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    let timer: number;
    const blink = (times: number) => {
      setClosed(true);
      timer = window.setTimeout(() => {
        setClosed(false);
        // 가끔은 두 번 연달아 깜빡
        timer = times > 1 ? window.setTimeout(() => blink(times - 1), 120) : window.setTimeout(next, random(1800, 5500));
      }, random(110, 170));
    };
    const next = () => blink(Math.random() < 0.25 ? 2 : 1);
    timer = window.setTimeout(next, random(1000, 3000));
    return () => clearTimeout(timer);
  }, []);

  // 두 장을 겹쳐 두고 보이기만 바꿔서, 깜빡일 때 이미지 로딩 깜빡임이 없게 함
  return (
    <span className={talking ? 'squirrel talking' : 'squirrel'} style={{ width: size, height: size }} role="img" aria-label="다람쥐">
      <img src={eyesOpen} alt="" style={{ opacity: closed ? 0 : 1 }} />
      <img src={eyesClosed} alt="" style={{ opacity: closed ? 1 : 0 }} />
    </span>
  );
}
