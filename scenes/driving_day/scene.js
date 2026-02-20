/**
 * Driving Day Scene - Volvo Interior (Daytime)
 * Transition scene for daytime drives through the Drenthe countryside.
 * Used for: Compascuum ↔ WSRT/ASTRON (Westerbork, ~40 min each way)
 *
 * Destinations handled:
 *   'astron'           → drive TO WSRT to meet Cees Bassa
 *   'home_from_astron' → drive back FROM WSRT after Cees's briefing
 */

const DrivingDayScene = {
    id: 'driving_day',
    name: 'Volvo - Day Drive',

    background: 'assets/images/scenes/driving_day.svg',

    description: 'Afternoon sun through the windscreen. Flat Drenthe fields, WSRT dishes on the horizon, your thoughts running ahead of the car.',

    playerStart: { x: 50, y: 50 },
    hotspots: [],

    // Store timeout IDs for cleanup
    _timeoutIds: [],

    onEnter: function(gameInstance) {
        const g = gameInstance || window.game;
        const destination = g.getFlag('driving_destination');

        console.log('[DrivingDay] Scene entered. Destination:', destination);

        // Clear any previous timeouts
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        if (destination === 'astron') {
            // Compascuum → Westerbork (~40 min, afternoon)
            const t1 = setTimeout(() => {
                g.startDialogue([
                    { speaker: '',      text: '*Afternoon sun on the N34. The Volvo heads south-west toward Westerbork.*' },
                    { speaker: 'Ryan',  text: 'Forty minutes. Maybe less — no tractors on a Thursday afternoon.' },
                    { speaker: 'Ryan',  text: 'Cees Bassa. Satellite tracker, ASTRON researcher, amateur radio wizard.' },
                    { speaker: 'Ryan',  text: 'If anyone can verify those schematics, it\'s him.' },
                    { speaker: '',      text: '*The flat Drenthe fields stretch to every horizon. Wind turbines turning slowly.*' },
                    { speaker: 'Ryan',  text: 'He was sceptical on the Meshtastic chat.' },
                    { speaker: 'Ryan',  text: '"Send me the data. I\'ll run it through the pipeline."' },
                    { speaker: 'Ryan',  text: 'Then silence for six hours. Then: "Get over here. Now."' },
                    { speaker: '',      text: '*Road sign flashes past: Westerbork 12 km*' },
                    { speaker: 'Ryan',  text: 'Whatever he found in that data was enough to pull me out of the mancave.' },
                    { speaker: 'Ryan',  text: 'ASTRON. Fourteen WSRT dishes listening to the cosmos.' },
                    { speaker: 'Ryan',  text: 'Today they listen for something man-made.' },
                    { speaker: '',      text: '*White parabolic dishes appear above the treeline, glinting in the sun.*' },
                    { speaker: 'Ryan',  text: 'There they are. Fourteen ears, all pointing the same way.' },
                    { speaker: 'Ryan',  text: 'Let\'s hear what Cees has to say.' }
                ]);

                const t2 = setTimeout(() => {
                    g.advanceTime(40);
                    g.loadScene('astron');
                }, 17000);
                this._timeoutIds.push(t2);
            }, 1000);
            this._timeoutIds.push(t1);

        } else if (destination === 'home_from_astron') {
            // Westerbork → Compascuum (~40 min, evening light)
            const t1 = setTimeout(() => {
                g.startDialogue([
                    { speaker: '',      text: '*The WSRT dishes shrink in the rear-view mirror. Golden evening light.*' },
                    { speaker: 'Ryan',  text: 'Confirmed. All of it. The weapon, the signal, the coordinates.' },
                    { speaker: 'Ryan',  text: '53.28 north, 7.42 east. Steckerdoser Heide. Right across the German border.' },
                    { speaker: '',      text: '*N34 heading north-east. Sky turning orange over the fields.*' },
                    { speaker: 'Ryan',  text: 'Cees was shaken. A man who tracks spy satellites for fun — shaken.' },
                    { speaker: 'Ryan',  text: 'Weaponised radio. Russian-school signal processing algorithms. Built on German soil.' },
                    { speaker: 'Ryan',  text: 'And he gave me a Meshtastic node. "Come back in one piece."' },
                    { speaker: '',      text: '*A canal barge passes below a bridge. The engine hum fills the cabin.*' },
                    { speaker: 'Ryan',  text: 'Now I have proof. The schematics. Cees\'s spectral analysis. The triangulated coordinates.' },
                    { speaker: 'Ryan',  text: 'But proof means nothing without action.' },
                    { speaker: 'Ryan',  text: 'Eva is counting on me. Time to plan the infiltration.' },
                    { speaker: '',      text: '*Approaching Compascuum. The outline of the farmhouse against the darkening sky.*' },
                    { speaker: 'Ryan',  text: 'One step closer. Try not to get killed on the next step.' }
                ]);

                const t2 = setTimeout(() => {
                    g.advanceTime(40);
                    g.loadScene('mancave');
                    g.showNotification('Returned to mancave');
                }, 15000);
                this._timeoutIds.push(t2);
            }, 1000);
            this._timeoutIds.push(t1);

        } else {
            console.warn('[DrivingDay] No recognised destination set! Flag was:', destination);
            const t = setTimeout(() => {
                g.loadScene('mancave');
            }, 2000);
            this._timeoutIds.push(t);
        }

        // Clear destination flag
        g.setFlag('driving_destination', null);
    },

    onExit: function() {
        this._timeoutIds.forEach(id => clearTimeout(id));
        this._timeoutIds = [];

        if (window.game && window.game.isDialogueActive) {
            window.game.endDialogue();
        }
    }
};

// Register scene
if (typeof game !== 'undefined' && game.registerScene) {
    game.registerScene(DrivingDayScene);
}
