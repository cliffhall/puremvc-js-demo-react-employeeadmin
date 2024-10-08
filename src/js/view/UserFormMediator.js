//
//  UserFormMediator.js
//  PureMVC JS Demo - React EmployeeAdmin
//
//  Copyright(c) 2024 Saad Shams <saad.shams@puremvc.org>
//  Your reuse is governed by the BSD 3-Clause License
//

import {Mediator} from "@puremvc/puremvc-js-multicore-framework";
import {ApplicationFacade} from "../ApplicationFacade";
import {UserProxy} from "../model/UserProxy";

export class UserFormMediator extends Mediator {

    static get NAME() { return "UserFormMediator" }

    listeners = null;

    constructor(component) {
        super(UserFormMediator.NAME, component);
        this.listeners = {
            [component.SAVE]: event => this.onSave(event.detail),
            [component.UPDATE]: event => this.onUpdate(event.detail),
            [component.CANCEL]: event => this.onCancel(event.detail)
        };
    }

    onRegister() {
        Object.keys(this.listeners).forEach(key => window.addEventListener(key, this.listeners[key]));

        this.userProxy = this.facade.retrieveProxy(UserProxy.NAME);
        this.userProxy.findAllDepartments()
            .then(departments => this.component.setDepartments(departments))
            .catch(error => this.component.setError(error));
    }

    onRemove() {
        Object.keys(this.listeners).forEach(key => window.removeEventListener(key, this.listeners[key]));
    }

    listNotificationInterests() {
        return [
            ApplicationFacade.NEW_USER,
            ApplicationFacade.USER_DELETED,
            ApplicationFacade.USER_SELECTED
        ]
    }

    handleNotification(notification) {
        switch (notification.name) {
            case ApplicationFacade.NEW_USER:
                this.component.setUser(notification.body);
                break;

            case ApplicationFacade.USER_DELETED:
                this.component.reset();
                break;

            case ApplicationFacade.USER_SELECTED:
                this.userProxy.findUserById(notification.body.id)
                    .then(user => this.component.setUser(user))
                    .catch(error => this.component.setError(error));
                break;

            default:
                break;
        }
    }

    async onSave(user) {
        const u = await this.userProxy.add(user);
        this.facade.sendNotification(ApplicationFacade.USER_SAVED, u);
    }

    async onUpdate(user) {
        await this.userProxy.update(user);
        this.facade.sendNotification(ApplicationFacade.USER_UPDATED, user);
    }

    onCancel() {
        this.facade.sendNotification(ApplicationFacade.CANCEL_SELECTED);
    }

    get component() {
        return this.viewComponent;
    }

}
