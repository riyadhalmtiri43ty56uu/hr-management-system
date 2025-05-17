# --- إنشاء هيكل مجلدات الواجهة الأمامية (Client) ---
Write-Host "Creating Client Structure..."
Push-Location client

# إنشاء مجلدات رئيسية في src
New-Item -ItemType Directory -Force -Path "src/assets" | Out-Null
New-Item -ItemType Directory -Force -Path "src/components/ui" | Out-Null
New-Item -ItemType Directory -Force -Path "src/components/layout" | Out-Null
New-Item -ItemType Directory -Force -Path "src/components/common" | Out-Null
New-Item -ItemType Directory -Force -Path "src/components/forms" | Out-Null
New-Item -ItemType Directory -Force -Path "src/config" | Out-Null
New-Item -ItemType Directory -Force -Path "src/contexts" | Out-Null
New-Item -ItemType Directory -Force -Path "src/features" | Out-Null
New-Item -ItemType Directory -Force -Path "src/hooks" | Out-Null
New-Item -ItemType Directory -Force -Path "src/lib" | Out-Null
New-Item -ItemType Directory -Force -Path "src/routes" | Out-Null
New-Item -ItemType Directory -Force -Path "src/services" | Out-Null
New-Item -ItemType Directory -Force -Path "src/utils" | Out-Null

# إنشاء ملفات .gitkeep للمجلدات الفارغة
@(
    "src/assets",
    "src/components/ui", "src/components/layout", "src/components/common", "src/components/forms",
    "src/contexts", "src/features", "src/hooks", "src/lib", "src/services", "src/utils"
) | ForEach-Object { New-Item -ItemType File -Force -Path "$_/ .gitkeep" | Out-Null }

# إنشاء مجلدات فرعية للميزات (Features)
$features = @("auth", "dashboard", "employees", "departments", "attendance", "leave", "payroll", "reports", "notifications", "settings")
foreach ($feature in $features) {
    New-Item -ItemType Directory -Force -Path "src/features/$feature/components" | Out-Null
    New-Item -ItemType Directory -Force -Path "src/features/$feature/pages" | Out-Null
    New-Item -ItemType Directory -Force -Path "src/features/$feature/services" | Out-Null
    # يمكنك إضافة مجلدات أخرى مثل utils إذا لزم الأمر لكل ميزة
}

# إنشاء ملفات أساسية (يمكنك إضافة المزيد)
New-Item -ItemType File -Force -Path "src/config/axiosInstance.js" | Out-Null
New-Item -ItemType File -Force -Path "src/config/i18n.js" | Out-Null
New-Item -ItemType File -Force -Path "src/contexts/AuthContext.jsx" | Out-Null
New-Item -ItemType File -Force -Path "src/contexts/SettingsContext.jsx" | Out-Null
New-Item -ItemType File -Force -Path "src/hooks/useAuth.js" | Out-Null
New-Item -ItemType File -Force -Path "src/hooks/useSettings.js" | Out-Null
New-Item -ItemType File -Force -Path "src/routes/index.jsx" | Out-Null
New-Item -ItemType File -Force -Path "src/routes/AppRoutes.jsx" | Out-Null
New-Item -ItemType File -Force -Path "src/routes/ProtectedRoute.jsx" | Out-Null
New-Item -ItemType File -Force -Path "src/utils/helpers.js" | Out-Null

# إنشاء مجلدات public
New-Item -ItemType Directory -Force -Path "public/assets/images" | Out-Null
New-Item -ItemType Directory -Force -Path "public/assets/fonts" | Out-Null
New-Item -ItemType Directory -Force -Path "public/locales" | Out-Null
@(
    "public/assets/images", "public/assets/fonts"
) | ForEach-Object { New-Item -ItemType File -Force -Path "$_/ .gitkeep" | Out-Null }
New-Item -ItemType File -Force -Path "public/locales/ar.json" | Out-Null
New-Item -ItemType File -Force -Path "public/locales/en.json" | Out-Null

Pop-Location
Write-Host "Client structure created."

# --- إنشاء هيكل مجلدات الواجهة الخلفية (Server) ---
Write-Host "Creating Server Structure..."
Push-Location server

# إنشاء مجلدات رئيسية في src
New-Item -ItemType Directory -Force -Path "src/config" | Out-Null
New-Item -ItemType Directory -Force -Path "src/controllers" | Out-Null
New-Item -ItemType Directory -Force -Path "src/middleware" | Out-Null
New-Item -ItemType Directory -Force -Path "src/routes" | Out-Null
New-Item -ItemType Directory -Force -Path "src/services" | Out-Null
New-Item -ItemType Directory -Force -Path "src/sockets/handlers" | Out-Null
New-Item -ItemType Directory -Force -Path "src/types" | Out-Null
New-Item -ItemType Directory -Force -Path "src/utils" | Out-Null
New-Item -ItemType Directory -Force -Path "src/validators" | Out-Null

# إنشاء مجلدات Prisma و Tests
New-Item -ItemType Directory -Force -Path "prisma/migrations" | Out-Null
New-Item -ItemType Directory -Force -Path "tests/unit" | Out-Null
New-Item -ItemType Directory -Force -Path "tests/integration" | Out-Null

# إنشاء ملفات .gitkeep
@(
    "src/middleware", "src/sockets/handlers", "src/types", "src/utils", "src/validators",
    "prisma/migrations", "tests/unit", "tests/integration"
) | ForEach-Object { New-Item -ItemType File -Force -Path "$_/ .gitkeep" | Out-Null }

# إنشاء ملفات أساسية (يمكنك إضافة المزيد)
$modules = @("auth", "user", "employee", "department", "attendance", "leave", "payroll", "report", "notification", "settings")
foreach ($module in $modules) {
    New-Item -ItemType File -Force -Path "src/controllers/$module.controller.js" | Out-Null
    New-Item -ItemType File -Force -Path "src/routes/$module.routes.js" | Out-Null
    New-Item -ItemType File -Force -Path "src/services/$module.service.js" | Out-Null
    if ($module -in @("auth", "employee")) { # أمثلة للمدققين
         New-Item -ItemType File -Force -Path "src/validators/$module.validators.js" | Out-Null
    }
}
New-Item -ItemType File -Force -Path "src/app.js" | Out-Null
New-Item -ItemType File -Force -Path "src/server.js" | Out-Null
New-Item -ItemType File -Force -Path "src/config/index.js" | Out-Null
New-Item -ItemType File -Force -Path "src/middleware/authenticate.js" | Out-Null
New-Item -ItemType File -Force -Path "src/middleware/errorHandler.js" | Out-Null
New-Item -ItemType File -Force -Path "src/routes/index.js" | Out-Null
New-Item -ItemType File -Force -Path "src/utils/ApiError.js" | Out-Null
New-Item -ItemType File -Force -Path "src/utils/asyncHandler.js" | Out-Null
New-Item -ItemType File -Force -Path "prisma/schema.prisma" | Out-Null
New-Item -ItemType File -Force -Path ".env.example" | Out-Null
New-Item -ItemType File -Force -Path "tests/setup.js" | Out-Null


Pop-Location
Write-Host "Server structure created."
Write-Host "Setup Complete!"