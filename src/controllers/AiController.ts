
const { Configuration, OpenAiApi } = require("openai");

const config = new Configuration({
    apiKey: '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'
});

const openai = new OpenAiApi(config);