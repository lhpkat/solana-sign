import useUserInfo from './useUserInfo';
import usehtmlToPdf, {
    getCanvasByDom,
    canvasToPdf,
    downPdf,
} from './usehtmlToPdf.js'

const bindPushState = () => {
    const bindEventListener = function (type) {
        const historyEvent = window.history[type];
        return function () {
            const newEvent = historyEvent.apply(this, arguments);
            const e = new Event(type);
            e.arguments = arguments;
            window.dispatchEvent(e);
            return newEvent;
        };
    };
    window.history.pushState = bindEventListener('pushState');
};

export {
    bindPushState,
    useUserInfo,
    usehtmlToPdf,
    getCanvasByDom,
    canvasToPdf,
    downPdf,
};
