/**
 * SDR Bench Scene — Software Defined Radio Workbench
 * Player learns about SDR, SSTV, spectrum analysis and decodes the 14.230 MHz signal.
 * Positioned: mancave → sdr_bench (via SDR equipment hotspot)
 */

const SdrBenchScene = {
    id: 'sdr_bench',
    name: 'SDR Workbench',

    background: 'assets/images/scenes/sdr_bench.svg',

    description: 'A software-defined radio workbench with spectrum analyzer and waterfall display.',

    playerStart: { x: 50, y: 88 },

    hotspots: [
        // ── Spectrum Analyzer (left monitor) ──
        {
            id: 'spectrum_display',
            name: 'Spectrum Analyzer',
            x: 6.25,
            y: 16.7,
            width: 40,
            height: 45.6,
            cursor: 'pointer',
            action: (game) => {
                const decoded = game.getFlag('sstv_decoded');
                if (decoded) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The spectrum is still showing that 14.230 MHz signal. Someone is still transmitting.' },
                        { speaker: 'Ryan', text: 'The spike pattern is characteristic of SSTV — Slow Scan Television. Each line of image data produces that narrow peak.' }
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The spectrum analyzer shows frequency vs signal power.' },
                        { speaker: 'Ryan', text: 'The X-axis is frequency in MHz. The Y-axis is signal strength in dBm — decibels relative to 1 milliwatt.' },
                        { speaker: 'Ryan', text: 'That big green spike at 14.230 MHz... that\'s not normal background noise.' },
                        { speaker: '', text: '*Ryan leans closer*' },
                        { speaker: 'Ryan', text: 'The shape of it — narrow band, persistent — that\'s a data transmission. Not voice, not noise.' },
                        { speaker: 'Ryan', text: 'The 14 MHz band is amateur radio territory. HF — high frequency, long range, bounces off the ionosphere.' },
                        { speaker: 'Ryan', text: 'This signal could be coming from hundreds of kilometres away. Or right next door.' },
                    ]);
                }
            }
        },

        // ── Waterfall Display (right monitor) ──
        {
            id: 'waterfall_display',
            name: 'Waterfall Display',
            x: 53.75,
            y: 16.7,
            width: 40,
            height: 45.6,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'The waterfall — time flows downward. Frequency is left to right. Signal strength is colour.' },
                    { speaker: 'Ryan', text: 'Dark blue is noise floor. Green and bright means energy — a real signal.' },
                    { speaker: 'Ryan', text: 'See those two bursts at 14.230 MHz? Separated by a quiet period.' },
                    { speaker: 'Ryan', text: 'That pattern... it matches SSTV. Slow Scan Television transmits images one line at a time.' },
                    { speaker: 'Ryan', text: 'Each burst is one frame. About 114 seconds for a full Martin M2 format image.' },
                    { speaker: 'Ryan', text: 'Someone sent two images over this frequency within the last 8 minutes.' },
                    { speaker: '', text: '📚 EDUCATIONAL: SSTV was developed in the 1960s for transmitting still images via radio. Ham operators still use it. Astronauts have sent SSTV images from the ISS on 145.800 MHz.' },
                ]);
            }
        },

        // ── SDR Dongle ──
        {
            id: 'sdr_dongle',
            name: 'RTL-SDR Dongle',
            x: 31,
            y: 65.5,
            width: 12,
            height: 8,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'My RTL-SDR dongle. Originally a cheap DVB-T television receiver — someone discovered you can reprogram it as a wideband radio receiver.' },
                    { speaker: 'Ryan', text: 'Costs about €25. Covers 500 kHz to 1.7 GHz. A few years ago this kind of receiver would cost thousands.' },
                    { speaker: 'Ryan', text: 'SDR — Software Defined Radio. Instead of hardware circuits doing the filtering and decoding, you do it in software on your computer.' },
                    { speaker: 'Ryan', text: 'Change the frequency, change the modulation, change the bandwidth — all in software. Infinitely flexible.' },
                    { speaker: '', text: '📚 EDUCATIONAL: RTL-SDR is used by researchers, hobbyists, aviation enthusiasts (ADS-B), weather satellite reception, and security researchers. LOFAR and modern radio telescopes use the same software-defined principle, just at much larger scale.' },
                ]);
            }
        },

        // ── SDR Controls Panel ──
        {
            id: 'sdr_controls',
            name: 'SDR Controls',
            x: 6.25,
            y: 66,
            width: 23.75,
            height: 18,
            cursor: 'pointer',
            action: (game) => {
                const decoded = game.getFlag('sstv_decoded');
                if (decoded) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Tuned to 14.230 MHz, USB mode, 3 kHz bandwidth. Locked on the signal.' },
                    ]);
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The controls: frequency, gain, demodulation mode, bandwidth.' },
                        { speaker: 'Ryan', text: 'I\'m tuned to 14.230 MHz — that\'s where the spike is. USB mode — Upper Sideband — correct for SSTV on HF.' },
                        { speaker: 'Ryan', text: 'Bandwidth at 3 kHz. SSTV uses about 2.7 kHz. Any narrower and I clip the signal. Any wider and I let in more noise.' },
                        { speaker: 'Ryan', text: 'The gain is set to 74% — high enough to copy the signal, not so high the receiver overloads.' },
                        { speaker: 'Ryan', text: 'Everything is set right. The SSTV decoder should be able to work with this.' },
                    ]);
                }
            }
        },

        // ── SSTV Decode Panel ──
        {
            id: 'sstv_decoder',
            name: 'SSTV Decoder — Decode Signal',
            x: 53.75,
            y: 66,
            width: 23.75,
            height: 18,
            cursor: 'pointer',
            action: (game) => {
                const decoded = game.getFlag('sstv_decoded');
                const receivedTransmission = game.getFlag('sstv_transmission_received');

                if (decoded) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Already decoded the transmission. The image showed coordinates near Westerbork.' },
                        { speaker: 'Ryan', text: 'Signal still active. Someone is still watching — or still sending warnings.' },
                    ]);
                } else if (receivedTransmission) {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'Signal detected on 14.230 MHz. Martin M2 format confirmed by the tone cadence.' },
                        { speaker: '', text: '*Ryan clicks the DECODE button*' },
                        { speaker: '', text: '*The SSTV decoder begins reconstructing the image, line by line — a static-streaked photograph slowly resolves...*' },
                        { speaker: 'Ryan', text: 'It\'s... aerial surveillance photography. A compound. Trees cleared around it. Power lines.' },
                        { speaker: 'Ryan', text: 'There\'s text overlaid on the image — steganographic encoding hidden in the SSTV frame.' },
                        { speaker: 'Ryan', text: '"52°27\'N 6°36\'E — OPERATION ZERFALL — NODE ACTIVE"' },
                        { speaker: 'Ryan', text: 'Those are GPS coordinates. Near Westerbork. Right next to WSRT.' },
                        { speaker: '', text: '📚 EDUCATIONAL: SSTV steganography — hiding data in the grey values of image pixels — is a real technique used by intelligence services. Operators monitoring amateur bands often miss it entirely.' },
                        { speaker: 'Ryan', text: 'Someone just told me exactly where to look. But who? And why?' },
                    ], () => {
                        game.setFlag('sstv_decoded', true);
                        game.setFlag('sstv_coordinates_known', true);
                        game.addEvidence({
                            id: 'sstv_decoded_image',
                            name: 'Decoded SSTV Image',
                            description: 'Aerial photograph with steganographic text: "52°27\'N 6°36\'E — OPERATION ZERFALL — NODE ACTIVE". Transmitted on 14.230 MHz, Martin M2 format.',
                            icon: '📡'
                        });
                        game.showNotification('📡 Evidence added: Decoded SSTV Image');
                        game.completeQuest('decode_sstv_signal');
                    });
                } else {
                    game.startDialogue([
                        { speaker: 'Ryan', text: 'The decoder is ready but there\'s nothing to decode yet. I need to wait for an incoming transmission on 14.230 MHz.' },
                        { speaker: 'Ryan', text: 'The spectrum shows some noise but no active SSTV signal right now.' },
                        { speaker: 'Ryan', text: 'I should check back here after I\'ve done more investigating. Something might come in.' },
                    ]);
                }
            }
        },

        // ── Education: What is SDR? ──
        {
            id: 'sdr_info_poster',
            name: 'How SDR Works (wall poster)',
            x: 2,
            y: 4.5,
            width: 26,
            height: 12,
            cursor: 'pointer',
            action: (game) => {
                game.startDialogue([
                    { speaker: '', text: '📚 WHAT IS SOFTWARE DEFINED RADIO?' },
                    { speaker: '', text: 'Traditional radio: hardware circuits fixed at manufacture — AM radio only does AM, FM radio only does FM.' },
                    { speaker: '', text: 'SDR: antenna → analog-to-digital converter → computer. The computer\'s software defines everything else.' },
                    { speaker: '', text: 'The same €25 dongle can receive FM radio, track aircraft (ADS-B), decode weather satellites, monitor power meters, analyse Wi-Fi, listen to amateur bands, and more.' },
                    { speaker: '', text: 'LOFAR is the world\'s largest SDR. 20,000+ antennas all feeding digital samples into a central supercomputer. The "telescope pointing" is pure mathematics.' },
                    { speaker: '', text: 'Jaap Haartsen\'s Bluetooth uses frequency-hopping spread spectrum — jumping 1600 times per second across 79 channels — inspired by military radio principles originally developed to prevent jamming.' },
                ]);
            }
        },

        // ── Back to mancave ──
        {
            id: 'back_to_mancave',
            name: 'Back to Mancave',
            x: 0,
            y: 80,
            width: 8,
            height: 20,
            cursor: 'pointer',
            targetScene: 'mancave'
        }
    ],

    onEnter: (game) => {
        if (!game.getFlag('visited_sdr_bench')) {
            game.setFlag('visited_sdr_bench', true);
            setTimeout(() => {
                game.startDialogue([
                    { speaker: 'Ryan', text: 'My SDR workbench. Software Defined Radio — one cheap dongle, infinite possibilities.' },
                    { speaker: 'Ryan', text: 'The spectrum analyzer is showing that anomaly on 14.230 MHz again. And the waterfall shows two recent bursts.' },
                    { speaker: 'Ryan', text: 'That is not random noise. Someone is transmitting intentionally on that frequency.' },
                ]);
            }, 500);
        } else if (game.getFlag('sstv_transmission_received') && !game.getFlag('sstv_decoded')) {
            if (!game.gameState.questsCompleted.includes('decode_sstv_signal') &&
                !game.gameState.activeQuests.find(q => q.id === 'decode_sstv_signal')) {
                game.addQuest({
                    id: 'decode_sstv_signal',
                    name: 'Decode the SSTV Signal',
                    description: 'An SSTV transmission is incoming on 14.230 MHz. Use the decoder to extract the hidden image.',
                    hint: 'Click on the SSTV Decoder hotspot on the right side of the workbench.'
                });
            }
            setTimeout(() => {
                game.showNotification('⚠ Incoming SSTV signal on 14.230 MHz — use the decoder!');
            }, 600);
        }
    },

    onExit: () => {}
};

if (typeof window !== 'undefined' && window.game) {
    window.game.registerScene(SdrBenchScene);
}
