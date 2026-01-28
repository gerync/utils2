// Global configuration that can be accessed anywhere
export let AppConfig: { messages: any; NoDupesAllowedOf: string[]; lang: string } | null = null;

export function setAppConfig(config: { messages: any; NoDupesAllowedOf: string[]; lang: string }) {
    AppConfig = config;
}

export function getAppConfig() {
    return AppConfig;
}
