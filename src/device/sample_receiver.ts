// Copyright 2024 Jacobo Tarrio Barreiro. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Demodulator } from '../protocol/ads-b-demodulator.js'

/** Interface for classes that get samples from a Radio class. */
export interface SampleReceiver {
  /** Sets the sample rate. */
  setSampleRate(sampleRate: number): void;

  /** Receives samples that should be demodulated. */
  receiveSamples(frequency: number, data: ArrayBuffer): void;

  /** Sets a sample receiver to be executed right after this one. */
  andThen(next: SampleReceiver): SampleReceiver;
}

export function concatenateReceivers(
  prev: SampleReceiver,
  next: SampleReceiver
): SampleReceiver {
  let list = [];
  if (prev instanceof ReceiverSequence) {
    list.push(...prev.receivers);
  } else {
    list.push(prev);
  }
  if (next instanceof ReceiverSequence) {
    list.push(...next.receivers);
  } else {
    list.push(next);
  }
  return new ReceiverSequence(list);
}

class ReceiverSequence implements SampleReceiver {
  constructor(public receivers: SampleReceiver[]) {}

  setSampleRate(sampleRate: number): void {
    for (let receiver of this.receivers) {
      receiver.setSampleRate(sampleRate);
    }
  }

  receiveSamples(frequency: number, data: ArrayBuffer): void {
    for (let receiver of this.receivers) {
      receiver.receiveSamples(frequency, data);
    }
  }

  andThen(next: SampleReceiver): SampleReceiver {
    return concatenateReceivers(this, next);
  }
}

export class LoggingReceiver implements SampleReceiver {
  private demodulator: Demodulator;

  constructor() {
    this.demodulator = new Demodulator();
  }

  setSampleRate(sampleRate: number): void {
    console.log("setSampleRate", sampleRate);
  }

  receiveSamples(frequency: number, data: ArrayBuffer): void {
    const samples = new Uint8Array(data);
    console.log("got samples", samples.length);
    this.demodulator.process(samples, 256000, (msg) => {
      console.log(msg);
    });
  }

  andThen(next: SampleReceiver): SampleReceiver {
    return concatenateReceivers(this, next);
  }
}
