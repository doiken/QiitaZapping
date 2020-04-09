import 'chrome-extension-async';

const classLR = {
    next: "_QZ_center_right _QZ_circle_right",
    previous: "_QZ_center_left _QZ_circle_left",
}
function insertDom(url: string, prevNext: string) {
    const hint = document.createElement("link");
    hint.rel = "prefetch";
    hint.as = "html";
    hint.href = url;
    hint.crossOrigin = "use-credentials";
    document.head.appendChild(hint);

    const a = document.createElement("a");
    a.href = url;
    a.className = `_QZ_center _QZ_circle ${classLR[prevNext]}`;
    document.body.appendChild(a);
}

async function appendPrefetchForNeibors() {
    // @ts-ignore
    const neibors = <QiitaApiCache.NeiborMap.Neibors> await chrome.runtime.sendMessage("neibors");
    const keys = Object.keys(neibors);
    if (keys.length === 0) return;
    keys.forEach((key) => {
        insertDom(neibors[key], key);
    });
}

appendPrefetchForNeibors();
