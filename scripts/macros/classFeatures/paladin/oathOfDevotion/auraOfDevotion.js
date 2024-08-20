import {combatUtils, effectUtils, genericUtils, itemUtils} from '../../../../utils.js';

async function create({trigger: {entity: item, target, identifier}}) {
    if (itemUtils.getConfig(item, 'combatOnly') && !combatUtils.inCombat()) return;
    let targetEffect = effectUtils.getEffectByIdentifier(target.actor, identifier);
    if (targetEffect) {
        if (targetEffect.origin === item.uuid) return;
        await genericUtils.remove(targetEffect);
    }
    let showIcon = itemUtils.getConfig(item, 'showIcon');
    let effectData = {
        name: item.name,
        img: item.img,
        origin: item.uuid,
        changes: [
            {
                key: 'system.traits.ci.value',
                mode: 0,
                value: 'charmed',
                priority: 20
            }
        ],
        flags: {
            'chris-premades': {
                aura: true,
                effect: {
                    noAnimation: true
                }
            },
            dae: {
                showIcon: showIcon
            }
        }
    };
    // await effectUtils.createEffect(target.actor, effectData, {parentEntity: item, identifier});
    return {
        effectData,
        effectOptions: {
            parentEntity: item,
            identifier
        }
    };
}
export let auraOfDevotion = {
    name: 'Aura of Devotion',
    version: '0.12.24',
    aura: [
        {
            pass: 'create',
            macro: create,
            priority: 50,
            distance: 'paladin',
            identifier: 'auraOfDevotionAura',
            disposition: 'ally',
            conscious: true
        }
    ],
    config: [
        {
            value: 'combatOnly',
            label: 'CHRISPREMADES.Config.CombatOnly',
            type: 'checkbox',
            default: false,
            category: 'mechanics'
        },
        {
            value: 'showIcon',
            label: 'CHRISPREMADES.Config.ShowIcon',
            type: 'checkbox',
            default: true,
            category: 'visuals'
        }
    ]
};