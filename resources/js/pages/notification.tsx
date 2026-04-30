import Heading from "@/components/heading";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import AppLayout from "@/layouts/app-layout";
import academic from '@/routes/academic';
import notificationsRoute from '@/routes/notifications';
import { Head, router } from "@inertiajs/react";
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Bell, CheckCircle2, ChevronLeft, FileUp, Inbox, CheckCheck, Trash2, Eye, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useMemo } from "react";

interface NotificationAction {
    route: string;
    params: Record<string, any>;
}

interface Notification {
    id: number;
    type: string;
    actor: string;
    message: string;
    action: NotificationAction;
    read_at: string | null;
    seen_at: string | null;
    created_at: string;
}

interface Props {
    title: string;
    notifications: Notification[];
}

export default function NotificationIndex({ title, notifications }: Props) {
    const [searchQuery, setSearchQuery] = useState("");

    const breadcrumbs = [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Notificaciones", href: "#" }
    ];

    const handleBack = () => {
        window.history.back();
    };

    const resolveWayfinderUrl = (routeName: string, params: any) => {
        const parts = routeName.split('.');
        let current: any = { academic };

        for (const part of parts) {
            current = current?.[part];
        }

        if (current && typeof current.url === 'function') {
            return current.url({ query: params });
        }

        return null;
    };

    const handleNotificationClick = (notification: Notification) => {
        const routeName = notification.action.route;
        const params = notification.action.params || {};

        console.log(routeName, params);

        if (!notification.read_at) {
            router.patch(notificationsRoute.read.url({ id: notification.id }), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    const url = resolveWayfinderUrl(routeName, params);
                    if (url) {
                        router.visit(url);
                    }
                }
            });
        } else {
            const url = resolveWayfinderUrl(routeName, params);
            if (url) {
                router.visit(url);
            }
        }
    };

    const markAllAsRead = () => {
        router.patch(notificationsRoute.markAllAsRead.url(), {}, { preserveScroll: true });
    };

    const deleteNotification = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        router.delete(notificationsRoute.destroy.url({ id }), { preserveScroll: true });
    };

    const toggleRead = (e: React.MouseEvent, notification: Notification) => {
        e.stopPropagation();
        if (!notification.read_at) {
            router.patch(notificationsRoute.read.url({ id: notification.id }), {}, { preserveScroll: true });
        }
    };

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n =>
            n.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [notifications, searchQuery]);

    const unreadNotificationsCount = notifications.filter(n => !n.read_at).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notificaciones" />
            <div className="flex flex-col flex-1 p-4 md:p-6 lg:p-10 bg-muted/20">
                <div className="max-w-4xl mx-auto w-full space-y-8">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleBack}
                                className="rounded-xl h-10 w-10 shrink-0 bg-background shadow-sm hover:shadow-md transition-all"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Notificaciones</h1>
                                <p className="text-sm text-muted-foreground">Gestiona tus alertas y avisos académicos</p>
                            </div>
                        </div>

                        {unreadNotificationsCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={markAllAsRead}
                                className="hidden sm:flex text-xs font-semibold rounded-lg h-9"
                            >
                                <CheckCheck className="mr-2 h-4 w-4 text-primary" />
                                Marcar todo como leído
                            </Button>
                        )}
                    </div>

                    <Card className="shadow-lg border-muted/40 rounded-2xl overflow-hidden bg-background">
                        <Tabs defaultValue="all" className="w-full">
                            <CardHeader className="p-0 border-b">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 gap-4">
                                    <TabsList className="h-10 p-1 bg-muted/50 rounded-lg self-start">
                                        <TabsTrigger value="all" className="rounded-md px-4 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                            Todas
                                            {notifications.length > 0 && (
                                                <span className="ml-2 py-0.5 px-1.5 rounded-full bg-muted text-[10px] font-bold">
                                                    {notifications.length}
                                                </span>
                                            )}
                                        </TabsTrigger>
                                        <TabsTrigger value="unread" className="rounded-md px-4 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                            No leídas
                                            {unreadNotificationsCount > 0 && (
                                                <span className="ml-2 py-0.5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                                                    {unreadNotificationsCount}
                                                </span>
                                            )}
                                        </TabsTrigger>
                                    </TabsList>

                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar notificaciones..."
                                            className="pl-9 h-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-lg text-sm"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardHeader>

                            <div className="bg-background min-h-[400px]">
                                <TabsContent value="all" className="m-0 border-none">
                                    <NotificationList
                                        items={filteredNotifications}
                                        onClick={handleNotificationClick}
                                        onDelete={deleteNotification}
                                        onToggleRead={toggleRead}
                                    />
                                </TabsContent>

                                <TabsContent value="unread" className="m-0 border-none">
                                    <NotificationList
                                        items={filteredNotifications.filter(n => !n.read_at)}
                                        onClick={handleNotificationClick}
                                        onDelete={deleteNotification}
                                        onToggleRead={toggleRead}
                                    />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

function NotificationList({ items, onClick, onDelete, onToggleRead }: {
    items: Notification[],
    onClick: (n: Notification) => void,
    onDelete: (e: React.MouseEvent, id: number) => void,
    onToggleRead: (e: React.MouseEvent, n: Notification) => void
}) {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="h-16 w-16 bg-muted/40 rounded-full flex items-center justify-center">
                    <Inbox className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <div>
                    <p className="font-semibold text-muted-foreground/80">No se encontraron notificaciones</p>
                    <p className="text-xs text-muted-foreground">Aquí aparecerán tus avisos pendientes</p>
                </div>
            </div>
        );
    }

    // Grouping by date
    const groups = useMemo(() => {
        const sorted = [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const grouped: Record<string, Notification[]> = {};

        sorted.forEach(item => {
            const date = new Date(item.created_at);
            let label = "";
            if (isToday(date)) label = "Hoy";
            else if (isYesterday(date)) label = "Ayer";
            else label = format(date, "EEEE d 'de' MMMM", { locale: es });

            if (!grouped[label]) grouped[label] = [];
            grouped[label].push(item);
        });

        return grouped;
    }, [items]);

    return (
        <div className="pb-4">
            <TooltipProvider delayDuration={100}>
                {Object.entries(groups).map(([label, groupItems]) => (
                    <div key={label} className="space-y-1 mt-6 first:mt-2">
                        <div className="px-6 py-2">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">{label}</h3>
                        </div>
                        <div className="divide-y divide-muted/30">
                            {groupItems.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onClick={onClick}
                                    onDelete={onDelete}
                                    onToggleRead={onToggleRead}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </TooltipProvider>
        </div>
    );
}

function NotificationItem({ notification, onClick, onDelete, onToggleRead }: {
    notification: Notification,
    onClick: (n: Notification) => void,
    onDelete: (e: React.MouseEvent, id: number) => void,
    onToggleRead: (e: React.MouseEvent, n: Notification) => void
}) {
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'DOSSIER_UPLOAD': return <FileUp className="h-3 w-3 text-blue-500" />;
            case 'DOSSIER_VALIDATION': return <CheckCircle2 className="h-3 w-3 text-green-500" />;
            default: return <Bell className="h-3 w-3 text-muted-foreground" />;
        }
    };

    return (
        <div
            onClick={() => onClick(notification)}
            className={cn(
                "group flex items-center h-20 gap-4 px-6 w-full text-left transition-all duration-150 cursor-pointer relative",
                notification.read_at ? "hover:bg-muted/30" : "bg-primary/2 hover:bg-primary/4"
            )}
        >
            {!notification.read_at && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            )}

            <div className="relative shrink-0">
                <Avatar className="h-10 w-10 border-2 bg-background shadow-none">
                    <AvatarFallback className="text-[10px] font-bold text-muted-foreground/60">
                        {getInitials(notification.actor)}
                    </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border shadow-sm ring-1 ring-background">
                    {getIcon(notification.type)}
                </div>
            </div>

            <div className="flex-1 min-w-0 pr-20">
                <p className={cn(
                    "text-sm tracking-tight truncate mb-0.5",
                    notification.read_at ? "text-muted-foreground/80 font-medium" : "text-foreground font-bold"
                )}>
                    {notification.actor}
                </p>
                <p className={cn(
                    "text-xs leading-snug line-clamp-1",
                    notification.read_at ? "text-muted-foreground/60" : "text-muted-foreground font-medium"
                )}>
                    {notification.message}
                </p>
            </div>

            <div className="shrink-0 flex items-center gap-4">
                <span className="text-[10px] text-muted-foreground/50 font-medium whitespace-nowrap group-hover:opacity-0 transition-opacity">
                    {format(new Date(notification.created_at), "HH:mm")}
                </span>

                <div className="absolute right-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    {!notification.read_at && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => onToggleRead(e, notification)}
                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-[10px] px-2 py-1">Marcar leída</TooltipContent>
                        </Tooltip>
                    )}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => onDelete(e, notification.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-[10px] px-2 py-1">Eliminar</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}