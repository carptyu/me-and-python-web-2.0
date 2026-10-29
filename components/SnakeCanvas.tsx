import React, { useEffect, useRef } from 'react';
import { SnakeEngine, type SnakeSpec } from './ascii-snakes';

type Props = {
    /** 畫布底色，要跟外層區塊一致 */
    background: string;
    /** 標題區塊：蛇頭會繞開它，字才不會被蓋住 */
    avoidRef?: React.RefObject<HTMLElement>;
    className?: string;
};

// 手機、電腦都只放兩隻：Banana 大一點、Piebald 小一點
const SNAKES: SnakeSpec[] = [
    { morph: 'banana', size: 1 },
    { morph: 'piebald', size: 0.93 },
];

/** 首頁 Hero 的 ASCII 球蟒畫布（游標＝小老鼠 @，點到蛇身才會縮成球） */
const SnakeCanvas: React.FC<Props> = ({ background, avoidRef, className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const engine = new SnakeEngine(canvas, SNAKES, { background });

        // 把標題區塊換算成畫布座標，略放大一圈當作蛇頭的禁區
        const measure = () => {
            const el = avoidRef?.current;
            if (!el) return;
            const a = el.getBoundingClientRect();
            const c = canvas.getBoundingClientRect();
            engine.setAvoid({
                x: a.left - c.left + a.width / 2,
                y: a.top - c.top + a.height / 2,
                rx: a.width * 0.58 + 24,
                ry: a.height * 0.6 + 24,
            });
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(canvas);
        if (avoidRef?.current) ro.observe(avoidRef.current);

        return () => {
            ro.disconnect();
            engine.destroy();
        };
        // 蛇的組合在畫布存在期間固定不變
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={className}
            style={{ fontFamily: '"Geist Mono", ui-monospace, Menlo, Consolas, monospace' }}
        />
    );
};

export default SnakeCanvas;
