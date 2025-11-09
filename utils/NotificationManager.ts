import { LoanApplication } from '../types';

/**
 * Registers the service worker.
 * @returns A promise that resolves with the ServiceWorkerRegistration or null on failure.
 */
const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered with scope:', registration.scope);
            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            return null;
        }
    }
    return null;
};

/**
 * Requests permission from the user to show notifications.
 * @returns A promise that resolves with the permission status ('granted', 'denied', 'default').
 */
const requestPermission = async (): Promise<NotificationPermission> => {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission;
    }
    return 'denied';
};

/**
 * Displays a notification using the service worker.
 * @param title The title of the notification.
 * @param options The notification options (body, icon, etc.).
 */
const displayNotification = (title: string, options: NotificationOptions) => {
    if ('serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, options);
        });
    }
};

// Use a simple in-memory set to track scheduled notifications for the current session
// to avoid creating duplicate setTimeout calls on re-renders.
const scheduledNotifications = new Set<string>();

/**
 * Schedules local notifications for upcoming loan installment due dates.
 * This is a simulation for demo purposes; a real app would use a push service.
 * @param loans The list of user's loan applications.
 */
const scheduleLoanNotifications = (loans: LoanApplication[]) => {
    if (Notification.permission !== 'granted') return;

    loans.forEach(loan => {
        loan.installments.forEach(installment => {
            const dueDate = new Date(installment.dueDate);
            const now = new Date();

            // Skip if the installment is already paid or the due date has passed.
            if (installment.status === 'PAYEE' || dueDate <= now) {
                return;
            }

            // --- Schedule a reminder notification for 1 day before the due date ---
            const reminderDate = new Date(dueDate.getTime() - (24 * 60 * 60 * 1000));
            const reminderId = `${loan._id}-${installment.installmentNumber}-reminder`;

            if (reminderDate > now && !scheduledNotifications.has(reminderId)) {
                const delay = reminderDate.getTime() - now.getTime();
                setTimeout(() => {
                    displayNotification('Rappel KobaRapide', {
                        body: `Votre échéance de ${installment.dueAmount}F pour le prêt "${loan.loanPurpose}" est prévue pour demain.`,
                        icon: '/logo.png',
                    });
                }, delay);
                scheduledNotifications.add(reminderId);
            }

            // --- Schedule a notification for the due date itself ---
            const dueId = `${loan._id}-${installment.installmentNumber}-due`;
            if (dueDate > now && !scheduledNotifications.has(dueId)) {
                 const delay = dueDate.getTime() - now.getTime();
                 setTimeout(() => {
                    displayNotification('Échéance de Prêt KobaRapide', {
                        body: `Votre échéance de ${installment.dueAmount}F pour le prêt "${loan.loanPurpose}" est aujourd'hui.`,
                        icon: '/logo.png',
                    });
                }, delay);
                scheduledNotifications.add(dueId);
            }
        });
    });
};

export const NotificationManager = {
    registerServiceWorker,
    requestPermission,
    scheduleLoanNotifications,
};
