/**
 * EventBus for cross-module communication
 * 
 * This utility enables communication between different submodules
 * without creating direct dependencies between them.
 */

type EventCallback = (data?: any) => void;

interface EventSubscription {
  unsubscribe: () => void;
}

class EventBus {
  private events: Map<string, Set<EventCallback>>;

  constructor() {
    this.events = new Map();
  }

  /**
   * Subscribe to an event
   * 
   * @param eventName - Name of the event to subscribe to
   * @param callback - Function to call when the event is emitted
   * @returns Subscription object with unsubscribe method
   */
  public subscribe(eventName: string, callback: EventCallback): EventSubscription {
    // Get or create the event callbacks set
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    
    const callbacks = this.events.get(eventName)!;
    callbacks.add(callback);
    
    return {
      unsubscribe: () => {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.events.delete(eventName);
        }
      }
    };
  }

  /**
   * Emit an event to all subscribers
   * 
   * @param eventName - Name of the event to emit
   * @param data - Optional data to pass to subscribers
   */
  public emit(eventName: string, data?: any): void {
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Check if an event has subscribers
   * 
   * @param eventName - Name of the event to check
   * @returns True if event has subscribers
   */
  public hasSubscribers(eventName: string): boolean {
    const callbacks = this.events.get(eventName);
    return !!callbacks && callbacks.size > 0;
  }

  /**
   * Remove all subscribers for an event
   * 
   * @param eventName - Name of the event to clear
   */
  public clearEvent(eventName: string): void {
    this.events.delete(eventName);
  }

  /**
   * Remove all subscribers for all events
   */
  public clearAll(): void {
    this.events.clear();
  }
}

// Create a singleton instance
const eventBus = new EventBus();

export default eventBus; 