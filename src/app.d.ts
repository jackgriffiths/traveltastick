// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session: {
        sessionId: string,
        registrationId: number | null,
        userId: number | null,
      } | null,
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export { };
