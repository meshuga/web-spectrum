/*!
meshuga/web-spectrum
Copyright (C) 2024 Patryk Orwat

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


const MAG_LUT = new Uint16Array(129 * 129 * 2);

// Populate the I/Q -> Magnitude lookup table. It is used because sqrt or
// round may be expensive and may vary a lot depending on the libc used.
//
// We scale to 0-255 range multiplying by 1.4 in order to ensure that every
// different I/Q pair will result in a different magnitude value, not losing
// any resolution.
for (let i = 0; i <= 128; i++) {
    for (let q = 0; q <= 128; q++) {
        MAG_LUT[i * 129 + q] = Math.round(Math.sqrt(i * i + q * q) * 360);
    }
}
export class Demodulator {
    private mag: Uint16Array;

    process(data, size, onMsg) {
        if (!this.mag) this.mag = new Uint16Array(size / 2);
        this.computeMagnitudeVector(data, size);

        const k = new Uint16Array(1000);
        for (let i = 0; i < 1000; i++) {
            let val = 0;
            for (let j = 0; j < 128; j++) {
                val += this.mag[i*128+j];
            }
            k[i] = val / 128;
        }
        // debugger;
        onMsg(k);
    }

    computeMagnitudeVector = function (data, size) {
        for (let j = 0; j < size; j += 2) {
            let i = data[j] - 127;
            let q = data[j + 1] - 127;

            if (i < 0) i = -i;
            if (q < 0) q = -q;
            this.mag[j / 2] = MAG_LUT[i * 129 + q];
        }
    };
    
}