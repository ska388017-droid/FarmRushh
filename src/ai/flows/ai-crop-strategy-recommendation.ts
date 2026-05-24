'use server';
/**
 * @fileOverview An AI-powered tool for providing crop strategy recommendations.
 *
 * - aiCropStrategyRecommendation - A function that handles the AI crop strategy recommendation process.
 * - AICropStrategyInput - The input type for the aiCropStrategyRecommendation function.
 * - AICropStrategyOutput - The return type for the aiCropStrategyRecommendation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AICropStrategyInputSchema = z.object({
  pastHarvests: z.array(
    z.object({
      cropType: z.string().describe('The type of crop harvested (e.g., Wheat, Corn).'),
      yieldAmount: z.number().describe('The amount of yield obtained from this harvest.'),
      harvestDate: z.string().describe('The in-game date of the harvest (e.g., "Day 15").'),
    })
  ).describe('A historical record of past crop harvests, including type, yield, and date.'),
  availableLandPlots: z.number().describe('The number of currently available land plots for planting.'),
  availableWater: z.number().describe('The current amount of available water resources.'),
  boosterInventory: z.array(
    z.object({
      boosterType: z.string().describe('The type of booster (e.g., Growth Potion, Super Fertilizer).'),
      quantity: z.number().describe('The quantity of this booster available.'),
    })
  ).describe('A list of available boosters and their quantities.'),
  currentInGameDate: z.string().describe('The current in-game date (e.g., "Day 123").'),
  userGameLevel: z.number().describe('The current game level of the user, influencing available options.'),
});
export type AICropStrategyInput = z.infer<typeof AICropStrategyInputSchema>;

const AICropStrategyOutputSchema = z.object({
  recommendedPlantingSchedule: z.array(
    z.object({
      cropType: z.string().describe('The type of crop to plant.'),
      plotsToUse: z.number().describe('The number of land plots recommended for this crop.'),
      plantingTime: z.string().describe('The ideal in-game date or period for planting this crop.'),
      expectedYieldIncrease: z.number().describe('The expected yield increase (e.g., in units or percentage) from this specific planting.'),
    })
  ).describe('A detailed schedule of recommended crops to plant, including quantities and timing.'),
  optimalBoosterUsage: z.array(
    z.object({
      boosterType: z.string().describe('The type of booster to use.'),
      cropType: z.string().optional().describe('The specific crop this booster should be applied to, if applicable.'),
      usageTime: z.string().describe('The ideal in-game date or stage of growth for using this booster.'),
      reasoning: z.string().describe('A brief explanation for using this booster at this time.'),
    })
  ).describe('Recommendations for using available boosters to maximize yield.'),
  overallStrategySummary: z.string().describe('A concise summary of the overall recommended strategy and its benefits.'),
  estimatedYieldIncreasePercentage: z.number().describe('The estimated overall percentage increase in yield expected from following this strategy.'),
});
export type AICropStrategyOutput = z.infer<typeof AICropStrategyOutputSchema>;

export async function aiCropStrategyRecommendation(input: AICropStrategyInput): Promise<AICropStrategyOutput> {
  return aiCropStrategyRecommendationFlow(input);
}

const aiCropStrategyRecommendationPrompt = ai.definePrompt({
  name: 'aiCropStrategyRecommendationPrompt',
  input: { schema: AICropStrategyInputSchema },
  output: { schema: AICropStrategyOutputSchema },
  prompt: `You are an expert agricultural strategist for a farming simulation game. Your goal is to analyze the user's past harvesting data and current resources to recommend the most efficient planting schedules and optimal booster usage to maximize their crop yield and overall game progression.

Here is the user's current data:

Current In-Game Date: {{{currentInGameDate}}}
User Game Level: {{{userGameLevel}}}
Available Land Plots: {{{availableLandPlots}}}
Available Water: {{{availableWater}}}

Past Harvesting Data:
{{#if pastHarvests}}
  {{#each pastHarvests}}
    - Crop: {{{cropType}}}, Yield: {{{yieldAmount}}}, Harvest Date: {{{harvestDate}}}
  {{/each}}
{{else}}
  No past harvesting data available. Assume a balanced initial strategy.
{{/if}}

Booster Inventory:
{{#if boosterInventory}}
  {{#each boosterInventory}}
    - Type: {{{boosterType}}}, Quantity: {{{quantity}}}
  {{/each}}
{{else}}
  No boosters available.
{{/if}}

Based on this information, provide a detailed strategy. The strategy should include:
1.  A recommended planting schedule, specifying crop types, the number of plots to use for each, and optimal planting times.
2.  Optimal booster usage, detailing which boosters to use, on which crops (if applicable), when to use them, and a brief reasoning for each.
3.  An overall summary of your strategy.
4.  An estimated overall percentage increase in yield expected from following your strategy.

Format your response as a JSON object strictly adhering to the AICropStrategyOutputSchema. Do not include any additional text or formatting outside the JSON object.
`,
});

const aiCropStrategyRecommendationFlow = ai.defineFlow(
  {
    name: 'aiCropStrategyRecommendationFlow',
    inputSchema: AICropStrategyInputSchema,
    outputSchema: AICropStrategyOutputSchema,
  },
  async (input) => {
    const { output } = await aiCropStrategyRecommendationPrompt(input);
    return output!;
  }
);
