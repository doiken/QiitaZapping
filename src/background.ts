import { QiitaZapping } from './QiitaZapping';

let zapping = new QiitaZapping();
const commands = {
    "go_to_next": (url: string) => zapping.goTo("next", url),
    "go_to_previous": (url: string) => zapping.goTo("previous", url),
};
chrome.commands.onCommand.addListener(function (command, tab) {
    if (!tab || !tab.url) return;
    commands[command](tab.url);
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'neibors':
            zapping.getNeighbors(request.url).then((neibors) => {
                sendResponse(neibors);
            })
            break;
        case 'refresh':
            zapping = new QiitaZapping();
            sendResponse("ok");
            break;
        default:
            console.log(request.message);
            sendResponse("ok");
    }
    return true; // necessary for asynchronous messaging
});