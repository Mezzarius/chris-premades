import {dialogUtils, genericUtils, itemUtils, tokenUtils} from '../../../../utils.js';

async function late({workflow}) {
    if (genericUtils.getIdentifier(workflow.item) !== 'eldritchBlast') return;
    if (!workflow.hitTargets.size) return;
    let originItem = itemUtils.getItemByIdentifier(workflow.actor, 'graspOfHadar');
    if (!originItem) return;
    let validTargets = Array.from(workflow.hitTargets.filter(i => tokenUtils.getDistance(workflow.token, i) > 5));
    if (!validTargets.length) return;
    let selection = await dialogUtils.confirm(originItem.name, genericUtils.format('CHRISPREMADES.Dialog.Use', {itemName: originItem.name}));
    if (!selection) return;
    let target;
    if (validTargets.length > 1) {
        selection = await dialogUtils.selectTargetDialog(originItem.name, 'CHRISPREMADES.Macros.GraspOfHadar.Select', validTargets);
        if (!selection?.length) return;
        target = selection[0];
    }
    if (!target) target = validTargets[0];
    let distance = tokenUtils.getDistance(workflow.token, target);
    let toMove = distance <= 10 ? -5 : -10;
    await originItem.use();
    await tokenUtils.pushToken(workflow.token, target, toMove);
}
export let graspOfHadar = {
    name: 'Eldritch Invocations: Grasp of Hadar',
    version: '0.12.54',
    midi: {
        actor: [
            {
                pass: 'rollFinished',
                macro: late,
                priority: 50
            }
        ]
    }
};