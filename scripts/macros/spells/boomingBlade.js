import {actorUtils, animationUtils, compendiumUtils, constants, dialogUtils, effectUtils, errors, genericUtils, itemUtils, socketUtils, workflowUtils} from '../../utils.js';
async function use({workflow}) {
    if (workflow.targets.size !== 1) return;
    let weapons = workflow.actor.items.filter(i => i.type === 'weapon' && i.system.equipped && i.system.actionType === 'mwak');
    if (!weapons.length) {
        genericUtils.notify('CHRISPREMADES.macros.boomingBlade.noWeapons', 'warn');
        return;
    }
    let selectedWeapon;
    if (weapons.length === 1) {
        selectedWeapon = weapons[0];
    } else {
        selectedWeapon = await dialogUtils.selectDocumentDialog(workflow.item.name, 'CHRISPREMADES.macros.boomingBlade.selectWeapon', weapons);
        if (!selectedWeapon) return;
    }
    let level = actorUtils.getLevelOrCR(workflow.actor);
    let diceNumber = Math.floor((level + 1) / 6);
    let weaponData = genericUtils.duplicate(selectedWeapon.toObject());
    delete weaponData._id;
    let damageType = itemUtils.getConfig(workflow.item, 'damageType');
    if (diceNumber) weaponData.system.damage.parts.push([diceNumber + 'd8[' + damageType + ']', damageType]);
    let attackWorkflow = await workflowUtils.syntheticItemDataRoll(weaponData, workflow.actor, [workflow.targets.first()]);
    if (!attackWorkflow) return;
    let playAnimation = itemUtils.getConfig(workflow.item, 'playAnimation');
    let color = itemUtils.getConfig(workflow.item, 'color');
    let jb2a = animationUtils.jb2aCheck();
    if (playAnimation && jb2a) {
        if (animationUtils.jb2aCheck() !== 'patreon') color = 'blue';
        if (color === 'random') {
            let colors = [
                'blue',
                'blue02',
                'dark_purple',
                'dark_red',
                'green',
                'green02',
                'orange',
                'red',
                'purple',
                'yellow',
                'blue'
            ];
            color = colors[Math.floor(Math.random() * colors.length)];
        }
        new Sequence()
            .effect()
            .file('jb2a.static_electricity.01.' + color)
            .atLocation(workflow.targets.first())
            .scaleToObject(1.5)
            .play();
    }

    if (!attackWorkflow.hitTargets.size) return;
    let effectData = {
        name: workflow.item.name,
        img: workflow.item.img,
        origin: workflow.item.uuid,
        duration: {
            seconds: 12
        },
        flags: {
            dae: {
                specialDuration: [
                    'turnStartSource'
                ]
            },
            'chris-premades': {
                boomingBlade: {
                    diceNumber: diceNumber,
                    damageType: damageType
                }
            }
        }
    };
    let effect = effectUtils.getEffectByIdentifier(attackWorkflow.targets.first().actor, 'boomingBlade');
    if (effect) {
        if (effect.flags['chris-premades'].boomingBlade.diceNumber > diceNumber) return;
        await genericUtils.remove(effect);
    }
    effectUtils.addMacro(effectData, 'movement', ['boomingBladeMoved']);
    await effectUtils.createEffect(workflow.targets.first().actor, effectData, {identifier: 'boomingBlade'});
}
async function moved({trigger}) {
    let effect = trigger.entity;
    let selection = await dialogUtils.confirm(effect.name, genericUtils.format('CHRISPREMADES.macros.boomingBlade.willingMove', {actorName: effect.parent.name}));
    if (!selection) return;
    let featureData = await compendiumUtils.getItemFromCompendium(constants.packs.spellFeatures, 'Booming Blade: Moved', {object: true, getDescription: true, translate: 'CHRISPREMADES.macros.boomingBlade.moved'});
    if (!featureData) {
        errors.missingPackItem();
        return;
    }
    let {diceNumber, damageType} = effect.flags['chris-premades'].boomingBlade;
    featureData.system.damage.parts = [
        [
            (diceNumber + 1) + 'd8[' + damageType + ']',
            damageType
        ]
    ];
    let parentActor = (await fromUuid(effect.origin))?.actor;
    if (!parentActor) return;
    await workflowUtils.syntheticItemDataRoll(featureData, parentActor, [actorUtils.getFirstToken(effect.parent)]);
    await genericUtils.remove(effect);
}
export let boomingBlade = {
    name: 'Booming Blade',
    version: '0.12.0',
    midi: {
        item: [
            {
                pass: 'rollFinished',
                macro: use,
                priority: 50
            }
        ]
    },
    config: [
        {
            value: 'damageType',
            label: 'CHRISPREMADES.config.damageType',
            type: 'select',
            default: 'thunder',
            options: constants.damageTypeOptions,
            homebrew: true,
            category: 'homebrew'
        },
        {
            value: 'playAnimation',
            label: 'CHRISPREMADES.config.playAnimation',
            type: 'checkbox',
            default: true,
            category: 'animation'
        },
        {
            value: 'color',
            label: 'CHRISPREMADES.config.color',
            type: 'select',
            default: 'blue',
            category: 'animation',
            options: [
                {
                    value: 'blue',
                    label: 'CHRISPREMADES.config.colors.blue'
                },
                {
                    value: 'blue02',
                    label: 'CHRISPREMADES.config.colors.blue02',
                    requiredModules: ['jb2a_patreon']
                },
                {
                    value: 'dark_purple',
                    label: 'CHRISPREMADES.config.colors.darkPurple',
                    requiredModules: ['jb2a_patreon']
                },
                {
                    value: 'dark_red',
                    label: 'CHRISPREMADES.config.colors.darkRed',
                    requiredModules: ['jb2a_patreon']
                },
                {
                    value: 'green',
                    label: 'CHRISPREMADES.config.colors.green',
                    requiredModules: ['jb2a_patreon']
                },
                {
                    value: 'green02',
                    label: 'CHRISPREMADES.config.colors.green02',
                    requiredModules: ['jb2a_patreon']
                },
                {
                    value: 'orange',
                    label: 'CHRISPREMADES.config.colors.orange',
                    requiredModules: ['jb2a_patreon']
                },
                {
                    value: 'red',
                    label: 'CHRISPREMADES.config.colors.red',
                    requiredModules: ['jb2a_patreon']
                },
                {
                    value: 'purple',
                    label: 'CHRISPREMADES.config.colors.purple',
                    requiredModules: ['jb2a_patreon']
                },
                {
                    value: 'yellow',
                    label: 'CHRISPREMADES.config.colors.yellow',
                    requiredModules: ['jb2a_patreon']
                },
                {
                    value: 'random',
                    label: 'CHRISPREMADES.config.colors.random',
                    requiredModules: ['jb2a_patreon']
                }
            ]
        },
    ]
};
export let boomingBladeMoved = {
    name: 'Booming Blade: Moved',
    version: boomingBlade.version,
    movement: [
        {
            pass: 'moved',
            macro: moved,
            priority: 250
        }
    ]
};