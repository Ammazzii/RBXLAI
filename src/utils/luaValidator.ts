import luaparse from 'luaparse';

export interface ValidationError {
  line: number;
  column: number;
  message: string;
  type: 'syntax' | 'warning' | 'roblox-api' | 'deprecated' | 'best-practice';
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Roblox Services and their common methods
const ROBLOX_SERVICES = {
  'game': {
    methods: ['GetService', 'FindService', 'GetChildren', 'FindFirstChild', 'WaitForChild'],
    properties: ['Players', 'Workspace', 'ReplicatedStorage', 'ServerStorage', 'StarterGui', 'StarterPack', 'StarterPlayer', 'Lighting', 'SoundService', 'TweenService', 'RunService', 'UserInputService', 'ContextActionService', 'GuiService', 'MarketplaceService', 'DataStoreService', 'MessagingService', 'TeleportService', 'HttpService', 'TextService', 'Chat', 'Teams', 'PathfindingService', 'CollectionService']
  },
  'Players': {
    methods: ['GetPlayers', 'FindFirstChild', 'GetChildren'],
    properties: ['LocalPlayer', 'PlayerAdded', 'PlayerRemoving'],
    events: ['PlayerAdded', 'PlayerRemoving', 'CharacterAdded', 'CharacterRemoving']
  },
  'Workspace': {
    methods: ['Raycast', 'GetPartBoundsInBox', 'GetPartBoundsInRegion3', 'FindFirstChild', 'GetChildren', 'WaitForChild'],
    properties: ['CurrentCamera', 'Gravity', 'FallenPartsDestroyHeight'],
    events: ['ChildAdded', 'ChildRemoved']
  },
  'UserInputService': {
    methods: ['IsKeyDown', 'IsMouseButtonPressed', 'GetMouseLocation', 'GetGamepadState'],
    properties: ['TouchEnabled', 'KeyboardEnabled', 'MouseEnabled', 'GamepadEnabled', 'VREnabled'],
    events: ['InputBegan', 'InputChanged', 'InputEnded', 'KeyDown', 'KeyUp']
  },
  'RunService': {
    methods: ['IsClient', 'IsServer', 'IsStudio'],
    properties: [],
    events: ['Heartbeat', 'RenderStepped', 'PreRender', 'PostSimulation', 'PreSimulation']
  },
  'TweenService': {
    methods: ['Create', 'GetValue'],
    properties: [],
    events: []
  },
  'ReplicatedStorage': {
    methods: ['FindFirstChild', 'GetChildren', 'WaitForChild'],
    properties: [],
    events: ['ChildAdded', 'ChildRemoved']
  },
  'ServerStorage': {
    methods: ['FindFirstChild', 'GetChildren', 'WaitForChild'],
    properties: [],
    events: ['ChildAdded', 'ChildRemoved']
  },
  'StarterGui': {
    methods: ['SetCore', 'GetCore', 'SetCoreGuiEnabled', 'GetCoreGuiEnabled'],
    properties: [],
    events: []
  }
};

// Deprecated Roblox APIs with regex patterns for accurate detection
const DEPRECATED_APIS = [
  {
    pattern: /\bwait\s*\(/g,
    message: 'Use task.wait() instead of wait()',
    api: 'wait'
  },
  {
    pattern: /\bspawn\s*\(/g,
    message: 'Use task.spawn() instead of spawn()',
    api: 'spawn'
  },
  {
    pattern: /\bdelay\s*\(/g,
    message: 'Use task.delay() instead of delay()',
    api: 'delay'
  },
  {
    pattern: /\.MouseButton1Down\b/g,
    message: 'Use Activated event instead for better touch support',
    api: 'MouseButton1Down'
  },
  {
    pattern: /\.MouseButton1Up\b/g,
    message: 'Use Activated event instead for better touch support',
    api: 'MouseButton1Up'
  },
  {
    pattern: /\.KeyDown\b/g,
    message: 'Use UserInputService.InputBegan instead',
    api: 'KeyDown'
  },
  {
    pattern: /\.KeyUp\b/g,
    message: 'Use UserInputService.InputEnded instead',
    api: 'KeyUp'
  },
  {
    pattern: /\bLoadLibrary\s*\(/g,
    message: 'LoadLibrary is deprecated, use ModuleScripts instead',
    api: 'LoadLibrary'
  }
];

// Common Roblox best practices
const BEST_PRACTICES = [
  {
    pattern: /game\.Players\.LocalPlayer\.Mouse/g,
    message: 'Consider using UserInputService instead of Mouse for better input handling',
    type: 'best-practice' as const
  },
  {
    pattern: /while\s+true\s+do/g,
    message: 'Infinite loops can cause lag. Consider using RunService events instead',
    type: 'best-practice' as const
  },
  {
    pattern: /\.Touched:Connect\(/g,
    message: 'Touched events can fire frequently. Consider using debouncing or Region3',
    type: 'best-practice' as const
  },
  {
    pattern: /game\.Workspace/g,
    message: 'Use workspace instead of game.Workspace for better performance',
    type: 'best-practice' as const
  }
];

export function validateLuaCode(code: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Return early if code is empty or only whitespace
  if (!code || code.trim().length === 0) {
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }

  // 1. Syntax validation using luaparse
  try {
    luaparse.parse(code, {
      locations: true,
      ranges: true,
      comments: false
    });
  } catch (syntaxError: unknown) {
    const error = syntaxError as { line?: number; column?: number; message?: string };
    // Always show syntax errors, even if line/column info is missing
    errors.push({
      line: error.line || 1,
      column: error.column || 1,
      message: error.message || 'Syntax error',
      type: 'syntax',
      severity: 'error',
      code: 'LUA_SYNTAX'
    });
  }

  // 2. Check for deprecated APIs using precise regex patterns
  DEPRECATED_APIS.forEach(deprecatedApi => {
    const matches = [...code.matchAll(deprecatedApi.pattern)];
    matches.forEach(match => {
      if (match.index !== undefined) {
        const beforeMatch = code.substring(0, match.index);
        const line = beforeMatch.split('\n').length;
        const column = beforeMatch.split('\n').pop()?.length || 0;

        warnings.push({
          line,
          column: column + 1,
          message: deprecatedApi.message,
          type: 'deprecated',
          severity: 'warning',
          code: 'DEPRECATED_API'
        });
      }
    });
  });

  // 3. Best practices validation
  BEST_PRACTICES.forEach(practice => {
    const matches = [...code.matchAll(practice.pattern)];
    matches.forEach(match => {
      if (match.index !== undefined) {
        const beforeMatch = code.substring(0, match.index);
        const line = beforeMatch.split('\n').length;
        const column = beforeMatch.split('\n').pop()?.length || 0;

        warnings.push({
          line,
          column: column + 1,
          message: practice.message,
          type: practice.type,
          severity: 'info',
          code: 'BEST_PRACTICE'
        });
      }
    });
  });

  // 4. Roblox API validation (basic)
  // Check for common typos in service names
  const gameServicePattern = /game:GetService\(["']([^"']+)["']\)/g;
  const serviceMatches = [...code.matchAll(gameServicePattern)];

  serviceMatches.forEach(match => {
    const serviceName = match[1];
    if (match.index !== undefined && !ROBLOX_SERVICES.game.properties.includes(serviceName)) {
      // Check if it's a close match to suggest corrections
      const suggestions = ROBLOX_SERVICES.game.properties.filter(service =>
        service.toLowerCase().includes(serviceName.toLowerCase()) ||
        serviceName.toLowerCase().includes(service.toLowerCase())
      );

      if (suggestions.length === 0) {
        const beforeMatch = code.substring(0, match.index);
        const line = beforeMatch.split('\n').length;
        const column = beforeMatch.split('\n').pop()?.length || 0;

        warnings.push({
          line,
          column: column + 1,
          message: `Unknown service "${serviceName}". Check if the service name is correct.`,
          type: 'roblox-api',
          severity: 'warning',
          code: 'UNKNOWN_SERVICE'
        });
      }
    }
  });

  // Check for accessing game.Players.LocalPlayer in server scripts
  const localPlayerPattern = /(game\.Players\.LocalPlayer|game:GetService\("Players"\)\.LocalPlayer)/g;
  const localPlayerMatches = [...code.matchAll(localPlayerPattern)];

  localPlayerMatches.forEach(match => {
    if (match.index !== undefined) {
      const beforeMatch = code.substring(0, match.index);
      const line = beforeMatch.split('\n').length;
      const column = beforeMatch.split('\n').pop()?.length || 0;

      warnings.push({
        line,
        column: column + 1,
        message: 'LocalPlayer is only available in LocalScripts and ModuleScripts run by LocalScripts',
        type: 'roblox-api',
        severity: 'warning',
        code: 'LOCALPLAYER_SERVER'
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Function to get error message for a specific line
export function getErrorsForLine(code: string, lineNumber: number): ValidationError[] {
  const result = validateLuaCode(code);
  return [...result.errors, ...result.warnings].filter(error => error.line === lineNumber);
}

// Function to get all validation issues
export function getAllValidationIssues(code: string): ValidationError[] {
  const result = validateLuaCode(code);
  return [...result.errors, ...result.warnings].sort((a, b) => {
    if (a.line !== b.line) return a.line - b.line;
    return a.column - b.column;
  });
}