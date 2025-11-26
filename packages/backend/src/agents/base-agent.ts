import { ollamaService } from '../services/ollama.service';
import { AgentRole } from '@crypto-intel/shared';

export interface AgentContext {
  cryptocurrency: string;
  analysisId: string;
  [key: string]: any;
}

export interface AgentResult {
  success: boolean;
  data?: any;
  error?: string;
  message: string;
}

export abstract class BaseAgent {
  protected role: AgentRole;
  protected systemPrompt: string;

  constructor(role: AgentRole, systemPrompt: string) {
    this.role = role;
    this.systemPrompt = systemPrompt;
  }

  /**
   * Execute the agent's task
   */
  abstract execute(context: AgentContext): Promise<AgentResult>;

  /**
   * Generate completion using LLM
   */
  protected async generate(prompt: string): Promise<string> {
    try {
      return await ollamaService.generate(prompt, this.systemPrompt);
    } catch (error) {
      console.error(`[${this.role}] Generation error:`, error);
      throw error;
    }
  }

  /**
   * Log agent message
   */
  protected log(message: string): void {
    console.log(`[${this.role.toUpperCase()}] ${message}`);
  }

  /**
   * Get agent role
   */
  getRole(): AgentRole {
    return this.role;
  }
}
