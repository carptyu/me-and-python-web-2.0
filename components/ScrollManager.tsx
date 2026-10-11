import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// BrowserRouter 不會管捲動位置，換頁時會沿用上一頁的 scrollY。
// 這裡統一處理：按上一頁／下一頁（POP）回到當時看到的位置；點連結換頁（PUSH/REPLACE）跳到 #錨點或頁首。
const positions = new Map<string, number>();

const ScrollManager = () => {
    const location = useLocation();
    const navType = useNavigationType();
    const keyRef = useRef(location.key);

    useEffect(() => {
        if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
        const onScroll = () => positions.set(keyRef.current, window.scrollY);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useLayoutEffect(() => {
        keyRef.current = location.key;
        const saved = navType === 'POP' ? positions.get(location.key) : undefined;
        const anchor = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;

        if (saved !== undefined) {
            window.scrollTo(0, saved);
            // 內容還沒撐開時（圖片載入等）scrollTo 會被截短，等幾個 frame 再補
            let tries = 0;
            const retry = () => {
                if (Math.abs(window.scrollY - saved) > 2 && tries++ < 20) {
                    window.scrollTo(0, saved);
                    requestAnimationFrame(retry);
                }
            };
            requestAnimationFrame(retry);
        } else if (anchor) {
            anchor.scrollIntoView();
        } else {
            window.scrollTo(0, 0);
        }
    }, [location.key]);

    return null;
};

export default ScrollManager;
