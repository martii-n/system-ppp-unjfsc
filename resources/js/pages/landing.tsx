import AppLogoIcon from '@/components/app-logo-icon';
import AppearanceToggleTab from '@/components/appearance-tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Building2,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    Facebook,
    FileText,
    Globe,
    GraduationCap,
    HelpCircle,
    Layers,
    LayoutDashboard,
    LogIn,
    LogOut,
    Mail,
    Search,
    ShieldCheck,
    Smartphone,
    Star,
    Users
} from 'lucide-react';

export default function Landing() {
    const { auth } = usePage().props;

    const sections = {
        roles: {
            estudiante: [
                { icon: Users, text: 'Registro de datos personales y académicos' },
                { icon: FileText, text: 'Carga de documentos de acreditación' },
                { icon: Smartphone, text: 'Seguimiento de la etapa de desarrollo' },
                { icon: ClipboardList, text: 'Registro de informes y evidencias' },
                { icon: Star, text: 'Consulta de calificación y estado final' },
            ],
            docente: [
                { icon: Users, text: 'Gestión de grupos de práctica asignados' },
                { icon: ShieldCheck, text: 'Validación de documentos de estudiantes' },
                { icon: Search, text: 'Monitoreo presencial y remoto (Supervisión)' },
                { icon: LayoutDashboard, text: 'Calificación de etapas y resultados' },
                { icon: FileText, text: 'Generación de actas de evaluación' },
            ],
            empresa: [
                { icon: Building2, text: 'Registro de Razón Social y datos de sede' },
                { icon: Users, text: 'Identificación de tutores y jefes directos' },
                { icon: Layers, text: 'Validación de convenios institucionales' },
                { icon: Globe, text: 'Control de ubicación de centros de práctica' },
                { icon: BookOpen, text: 'Banco de datos de empresas receptoras' },
            ]
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10">
            <Head>
                <title>Sistema de Prácticas | UNJFSC</title>
                <meta name="description" content="Sistema de Gestión de Prácticas Pre Profesionales - Universidad Nacional José Faustino Sánchez Carrión" />
            </Head>

            {/* Header / Navbar */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
                <div className="container mx-auto px-4 flex h-16 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex aspect-square size-10 items-center justify-center rounded-md">
                            <AppLogoIcon className="size-9 fill-current" />
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-sm font-bold block leading-none">Sistema de Prácticas</span>
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">UNJFSC</span>
                        </div>
                    </div>

                    <nav className="flex items-center gap-4">
                        <div className="hidden md:flex gap-6 mr-6">
                            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Nosotros</a>
                            <a href="#roles" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Roles</a>
                            <a href="#process" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Proceso</a>
                            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Ayuda</a>
                        </div>

                        <AppearanceToggleTab className="hidden sm:inline-flex" />

                        <Separator orientation="vertical" className="h-6 hidden sm:block" />

                        {auth.user ? (
                            <Button asChild variant="secondary">
                                <Link href="/dashboard" className="flex items-center gap-2">
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Ir al Panel</span>
                                </Link>
                            </Button>
                        ) : (
                            <Button asChild>
                                <Link href="/login" className="flex items-center gap-2">
                                    <LogIn className="h-4 w-4" />
                                    <span>Acceder</span>
                                </Link>
                            </Button>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-20 lg:py-32 overflow-hidden border-b bg-muted/20">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col items-center text-center space-y-8">
                            <Badge variant="outline" className="px-4 py-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                Universidad Nacional José Faustino Sánchez Carrión
                            </Badge>

                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-4xl text-foreground">
                                Sistema de Gestión de <br />
                                <span className="text-primary tracking-tighter">Prácticas Pre Profesionales</span>
                            </h1>

                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed h-auto">
                                Optimización administrativa y seguimiento académico centralizado para todas las facultades. Conecta tu potencial académico con el sector productivo líder en el país.
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <Button size="lg" asChild>
                                    <a href="#roles">Explorar Funcionalidades</a>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="/login">Acceder al Sistema</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission & Vision Section */}
                <section id="about" className="py-24 container mx-auto px-4 grid md:grid-cols-2 gap-12">
                    <Card className="shadow-sm border-muted">
                        <CardHeader>
                            <Badge variant="secondary" className="w-fit mb-2">Academico</Badge>
                            <CardTitle className="text-3xl font-bold tracking-tight">Misión</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                Formar profesionales líderes en sus respectivas disciplinas, con sólidos valores éticos y compromiso social, capaces de generar conocimiento científico y tecnológico para el desarrollo sostenible de la región y el país.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-muted bg-muted/10">
                        <CardHeader>
                            <Badge variant="secondary" className="w-fit mb-2">Institucional</Badge>
                            <CardTitle className="text-3xl font-bold tracking-tight">Visión</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                Ser una universidad referente nacional e internacional en calidad educativa, investigación e innovación, reconocida por su contribución al bienestar de la sociedad y la formación de ciudadanos del mundo.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Roles / Platform Structure */}
                <section id="roles" className="py-24 bg-muted/30 border-y">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">Estructura de la Plataforma</h2>
                            <p className="text-muted-foreground italic">Servicios centralizados diseñados para cada pilar del proceso.</p>
                        </div>

                        <Tabs defaultValue="estudiante" className="max-w-5xl mx-auto ring-offset-background">
                            <TabsList className="grid w-full grid-cols-3 h-12">
                                <TabsTrigger value="estudiante" className="text-sm font-semibold">Estudiante</TabsTrigger>
                                <TabsTrigger value="docente" className="text-sm font-semibold">Docente</TabsTrigger>
                                <TabsTrigger value="empresa" className="text-sm font-semibold">Empresa</TabsTrigger>
                            </TabsList>

                            {Object.entries(sections.roles).map(([role, items]) => (
                                <TabsContent key={role} value={role} className="mt-8">
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
                                        <Card className="border-none bg-transparent shadow-none">
                                            <CardHeader className="px-0">
                                                <CardTitle className="capitalize text-2xl font-bold">Servicios para el {role}</CardTitle>
                                                <CardDescription>Principales acciones y herramientas disponibles.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="px-0">
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {items.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-4 p-4 rounded-lg bg-background border shadow-xs hover:border-primary/50 transition-colors group">
                                                            <div className="p-2 bg-muted rounded-md group-hover:text-primary transition-colors">
                                                                <item.icon className="h-5 w-5" />
                                                            </div>
                                                            <span className="text-sm font-medium">{item.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                </section>

                {/* Process Stages Section */}
                <section id="process" className="py-24">
                    <div className="container mx-auto px-4 text-center">
                        <div className="mb-16 space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">Etapas del Proceso de Prácticas</h2>
                            <p className="text-muted-foreground">Estructura administrativa oficial bajo normativa universitaria.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12 text-left">
                            {[
                                {
                                    title: 'Acreditación',
                                    desc: 'Registro y validación de los pilares: Estudiantes, Docentes y Empresas (Razón Social).',
                                    icon: CheckCircle2
                                },
                                {
                                    title: 'Desarrollo',
                                    desc: 'Gestión técnica, monitoreo académico y carga de evidencias en tiempo real.',
                                    icon: GraduationCap
                                },
                                {
                                    title: 'Finalización',
                                    desc: 'Revisión técnica de informes finales y cierre oficial del expediente académico.',
                                    icon: FileText
                                }
                            ].map((stage, i) => (
                                <div key={i} className="flex flex-col space-y-4 p-6 rounded-xl border bg-card/40 hover:bg-card transition-colors">
                                    <div className="p-3 w-fit bg-primary/10 text-primary rounded-lg mb-2">
                                        <stage.icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-bold">{stage.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{stage.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="py-24 bg-muted/10 border-t">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="grid lg:grid-cols-5 gap-12">
                            <div className="lg:col-span-2 space-y-4">
                                <h2 className="text-3xl font-bold tracking-tight">Preguntas Frecuentes</h2>
                                <p className="text-muted-foreground">Todo lo que necesitas saber para iniciar y concluir tus prácticas con éxito.</p>

                                <div className="p-4 bg-background border rounded-lg flex items-start gap-4">
                                    <HelpCircle className="h-6 w-6 text-primary shrink-0" />
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Si no encuentras tu duda aquí, contacta con la oficina de prácticas de tu facultad.
                                    </p>
                                </div>
                            </div>

                            <div className="lg:col-span-3">
                                <Accordion type="single" collapsible className="w-full">
                                    {[
                                        { t: '¿Qué tiempo duran las prácticas?', a: 'Tienen una duración mínima de 4 meses (320 horas) hasta un máximo de 6 meses, según el plan de estudios.' },
                                        { t: '¿Qué tipo de modalidades existen?', a: 'Existen dos: Por Desarrollo (durante el semestre) y Por Convalidación (experiencia laboral previa).' },
                                        { t: '¿Cuáles son los requisitos iniciales?', a: 'Matrícula vigente, aprobación de prerrequisitos y asignación de un docente supervisor.' },
                                        { t: '¿Cómo obtengo mis credenciales?', a: 'Son gestionadas por tu facultad. Usuario: Correo institucional. Contraseña: DNI.' }
                                    ].map((q, i) => (
                                        <AccordionItem key={i} value={`item-${i}`} className="border-b last:border-b-0">
                                            <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-primary transition-colors text-left py-4 px-0">
                                                {q.t}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                                                {q.a}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t bg-muted/30">
                <div className="container mx-auto px-4 py-16">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="flex aspect-square items-center justify-center rounded-md">
                            <AppLogoIcon className="size-24 fill-current" />
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-base font-bold uppercase tracking-tight">Universidad Nacional José Faustino Sánchez Carrión</h3>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Sede Central - Huacho, Perú</p>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                <Facebook className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                <Globe className="h-5 w-5" />
                            </Button>
                        </div>

                        <Separator className="w-24 mx-auto" />

                        <p className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase">
                            Sistema de Prácticas &copy; {new Date().getFullYear()} Todos los derechos reservados
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
