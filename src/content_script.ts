import 'chrome-extension-async';

async function appendPrefetchForNeibors() {
    // @ts-ignore
    const neibors = <QiitaApiCache.NeiborMap.Neibors> await chrome.runtime.sendMessage("neibors");
    const keys = Object.keys(neibors);
    if (keys.length === 0) return;
    keys.forEach(function (key) {
        const hint = document.createElement("link");
        hint.rel = "prefetch";
        hint.as = "html";
        hint.href = neibors[key];
        hint.crossOrigin = "use-credentials";
        document.head.appendChild(hint);
    });
}

window.onload = appendPrefetchForNeibors;
