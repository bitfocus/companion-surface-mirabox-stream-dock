## Mirabox Stream Dock

Mirabox makes many Stream Deck clones, sold as Stream Dock. Some other companies also resell these under their own brand names and many of these OEM versions are supported by this module. Unfortunately they are not all tested and your mileage may vary.

To use a Stream Dock with Companion, the Mirabox creator software must not be running (not even minimized to the dock). Also enable Mirabox Stream Dock integration at Companion's integrations page.

Some Stream Dock models do not provide separate press and release events for all controls — this is a hardware limitation.  
Some Stream Dock models do not provide n-key rollover, that means you can only press one key at a time. Even worse when you press a second or third key while holding the first one down, the first key may be temporarily unpressed or or just nothing happens. This is a hardware limitation.

### Mirabox Stream Dock 293V3

_5×3 LCD keys_

The layout is straightforward: all keys map directly to the Companion grid.

### Mirabox Stream Dock XL

_8x4 LCD keys, rocker switches on left and right side, LED strips_

The XL layout includes the rocker switches on the left and right side at individual buttons. Each rocker switch can be either pushed upwards or downwards or inwards or released. As companion doesn't feature such a four-way switch, these functions are mapped to the press and release actions of three individual buttons. The layout starts with the left rocker switch at the position where normally the navigation buttons are located. The LCD buttons start at the second column if you don't give the surface an offset.

The two LED strips on the left and right side can only be controlled with one color. In the surface configuration you can chose if you want to have them permanently off, use the built-in rainbow color animation or make the LEDs follow the color of button 3/1 (left bottom). Due to hardware limitation there is a brightness jump from totally black to the darkest possible colors.

You can only push one button at a time. When you push a second button, sometimes the second button will turn on and the first will turn off, sometimes both will turn off and sometimes the first stays on and the second is ignored. You can use one LCD button and one rocker at the same time, but also you can't use the left and the right rocker at the same time.

![Stream Dock XL mapping](images/mirabox-streamdock-xl.png?raw=true 'Stream Dock XL mapping')

### Mirabox Stream Dock N3, Ajazz AKP03E

_3x2 LCD keys, 3 buttons, 3 rotary encoders_

The N3 has two rows of 3 LCD keys that map to the Companion grid. There are three non-LCD buttons underneath.

There's a large rotary encoder, shown as Rotary 1 and two smaller encoders shown as Rotary 2 and 3. To use the rotary encoders for a specific button, enable the `Enable Rotary Actions` checkbox for that button. This adds additional action groups that Companion will use when the encoder is rotated.

![Stream Dock N3 mapping](images/mirabox-streamdock-n3.png?raw=true 'Stream Dock N3 mapping')

### Mirabox Stream Dock N4, Ajazz AKP05E

_5×2 LCD keys, 4 rotary encoders, LCD strip with touch buttons, integrated USB hub_

The N4 has two rows of five LCD keys that map to the Companion grid. The LCD strip provides four soft keys and four rotary encoders. For compatibility with Stream Deck-style layouts, these four controls are left-aligned in Companion. Although the controls are evenly spaced across the width of the five LCD keys on the device, Companion places them in the first four columns.

The soft keys and rotary encoders do not provide individual press and release events. Soft keys only generate an event when you release your finger, and the rotary encoders only generate an event when you press (push) the encoder. Companion synthesizes a press followed by a release for these controls for compatibility.

To use the rotary encoders for a specific button, enable the `Enable Rotary Actions` checkbox for that button. This adds additional action groups that Companion will use when the encoder is rotated.

The LCD strip also supports a swipe gesture. Swipe events are mapped to the rotary actions of the fifth button in the third row.

![Stream Dock N4 mapping](images/mirabox-streamdock.png?raw=true 'Stream Dock N4 mapping')

### Mirabox Stream Dock M18V3

_5x3 LCD keys, 3 buttons, 2 LEDs_

Currently the LCD keys and the regular buttons are supported.

### Mirabox Stream Dock HSV293S, Ajazz AKP153, Ajazz AKP153E

_5x3 LCD keys, vertical LCD sidescreen_

The vertical sidescreen is mapped to three more buttons, so in total it is a 6x3 surface.
