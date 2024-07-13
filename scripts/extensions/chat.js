import {Medkit} from '../applications/medkit.js';
import {genericUtils} from '../utils.js';
async function createChatMessage(message, options, userId) {
    let buttonData = message.flags?.['chris-premades']?.button;
    if (!buttonData) return;
    await genericUtils.sleep(100);
    let messageElement = document.querySelector('[data-message-id="' + message.id + '"]');
    if (!messageElement) return;
    switch (buttonData.type) {
        case 'updateItem': {
            let button = messageElement.querySelector('[class="chris-update-item"]');
            if (!button) return;
            button.addEventListener('click', async () => {
                let item = await fromUuid(buttonData.data.itemUuid);
                if (!item) return;
                await Medkit.item(item);
                await message.delete();
            });
        }  
    }
}
export let chat = {
    createChatMessage
};