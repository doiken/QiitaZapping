import { QiitaZapping } from './QiitaZapping';

let zapping = new QiitaZapping();
const commands = {
    "go_to_next": () => zapping.goTo("next"),
    "go_to_previous": () => zapping.goTo("previous"),
};
chrome.commands.onCommand.addListener(function (command) {
    commands[command]();
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request) {
        case 'neibors':
            zapping.getNeighbors().then((neibors) => {
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