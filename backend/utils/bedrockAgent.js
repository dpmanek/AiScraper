const {
	BedrockAgentRuntimeClient,
	InvokeAgentCommand,
} = require('@aws-sdk/client-bedrock-agent-runtime');
require('dotenv').config();

/**
 * Invokes a Bedrock agent to run an inference using the input
 * provided in the request body.
 *
 * @param {string} prompt - The prompt that you want the Agent to complete.
 * @param {string} sessionId - An arbitrary identifier for the session.
 * @param {Object} options - Additional options for the agent.
 * @param {string} options.region - AWS region (defaults to us-east-1).
 * @param {Object} options.credentials - AWS credentials (optional).
 * @returns {Promise<Object>} - The response from the Bedrock agent.
 */
const invokeBedrockAgent = async (prompt, sessionId, options = {}) => {
	console.log(`Invoking Bedrock agent with session ID: ${sessionId}`);

	const { region, credentials } = options;

	// Initialize the client with credentials from environment variables or passed options
	const clientOptions = {
		region: region || process.env.AWS_REGION || 'us-east-1',
	};

	// Use provided credentials if available, otherwise use environment variables
	if (credentials) {
		clientOptions.credentials = credentials;
	} else if (
		process.env.AWS_ACCESS_KEY_ID &&
		process.env.AWS_SECRET_ACCESS_KEY
	) {
		clientOptions.credentials = {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		};
	}

	const client = new BedrockAgentRuntimeClient(clientOptions);

	// Agent IDs from environment variables or fallback to friend's IDs
	const agentId = process.env.AWS_BEDROCK_AGENT_ID || 'RNXSVSMKC8';
	const agentAliasId = process.env.AWS_BEDROCK_AGENT_ALIAS_ID || 'D60PWNSM5X';

	const command = new InvokeAgentCommand({
		agentId,
		agentAliasId,
		sessionId,
		inputText: prompt,
		// inputText: 'How are you?',
		enableTrace: true,
	});

	try {
		let completion = '';
		const response = await client.send(command);

		console.log('=== BEDROCK RESPONSE ===');
		console.log('Full response object:', JSON.stringify(response, null, 2));

		if (response.completion === undefined) {
			throw new Error('Completion is undefined');
		}

		console.log('=== BEDROCK COMPLETION STREAM ===');
		for await (const chunkEvent of response.completion) {
			console.log('Chunk event received:', JSON.stringify(chunkEvent, null, 2));

			const chunk = chunkEvent.chunk;
			if (chunk && chunk.bytes) {
				const decodedResponse = new TextDecoder('utf-8').decode(chunk.bytes);
				// console.log('Decoded chunk:', decodedResponse);
				completion += decodedResponse;
			} else {
				console.log('Chunk or bytes is undefined:', chunkEvent);
			}
		}

		console.log('=== BEDROCK FINAL COMPLETION ===');
		console.log('Final completion text:', completion);
		// console.log('Completion length:', completion.length);
		console.log('Bedrock agent invocation completed successfully');

		return { sessionId, completion };
	} catch (err) {
		console.error('=== BEDROCK ERROR ===');
		console.error('Error invoking Bedrock agent:', err.message);
		console.error('Full error object:', err);
		throw err;
	}
};

/**
 * Invokes a Bedrock agent with a SIMBA ticket ID.
 * This function passes the SIMBA ID as the prompt and generates a 6-digit session ID.
 *
 * @param {string} simbaId - The SIMBA ID of the ticket.
 * @returns {Promise<Object>} - The response from the Bedrock agent.
 */
const processSimbaTicket = async (simbaId) => {
	console.log(`Processing SIMBA ticket: ${simbaId}`);

	try {
		// Create a 6-digit session ID
		const sessionId = Math.floor(100000 + Math.random() * 900000).toString();
		console.log(`sessionId: ${sessionId}`);
		// Use the SIMBA ID as the prompt directly
		const prompt = simbaId;
		// const prompt ='Hey Partha! This is our call to test out Bedrock Connection';

		// Invoke the Bedrock agent
		const result = await invokeBedrockAgent(prompt, sessionId);
		console.log(`SIMBA ticket ${simbaId} processed successfully`);
		return result;
	} catch (error) {
		console.error(`Error processing SIMBA ticket ${simbaId}:`, error.message);
		throw error;
	}
};

module.exports = {
	invokeBedrockAgent,
	processSimbaTicket,
};
