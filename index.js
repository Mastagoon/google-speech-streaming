//@ts-ignore
import recorder from 'node-record-lpcm16';
import fs from "fs"

// Imports the Google Cloud client library
import speech from '@google-cloud/speech';

// Creates a client
const client = new speech.SpeechClient();

const file = fs.createWriteStream('test.wav', { encoding: 'binary' })

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';

const request = {
	config: {
		encoding: encoding,
		sampleRateHertz: sampleRateHertz,
		languageCode: languageCode,
	},
	interimResults: false, // If you want interim results, set this to true
};

// Create a recognize stream
const recognizeStream = client
	.streamingRecognize({
		config: {
			encoding: encoding,
			sampleRateHertz: sampleRateHertz,
			languageCode: languageCode,
		},
		interimResults: true, // If you want interim results, set this to true
	})
	.on('error', console.error)
	.on('data', data =>
		process.stdout.write(
			data.results[0] && data.results[0].alternatives[0]
				? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
				: '\n\nReached transcription time limit, press Ctrl+C\n'
		)
	);

// Start recording and send the microphone input to the Speech API.
// Ensure SoX is installed, see https://www.npmjs.com/package/node-record-lpcm16#dependencies
recorder
	.record({
		sampleRate: 16000,
		// threshold: 0,
		// Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
		// verbose: true,
		// recordProgram: 'rec', // Try also "arecord" or "sox"
		// silence: '10.0',
	})
	.stream(recognizeStream)
	.on('error', console.error)
	.pipe(file)

console.log('Listening, press Ctrl+C to stop.');
