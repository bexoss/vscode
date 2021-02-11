/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IStorageService } from 'vs/platform/storage/common/storage';
import { UserDataAutoSyncEnablementService } from 'vs/platform/userDataSync/common/userDataAutoSyncService';
import { IUserDataSyncStoreManagementService } from 'vs/platform/userDataSync/common/userDataSync';
import { IWorkspaceTrustService, WorkspaceTrustState } from 'vs/platform/workspace/common/workspaceTrust';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';

export class WebUserDataAutoSyncEnablementService extends UserDataAutoSyncEnablementService {

	private enabled: boolean | undefined = undefined;

	constructor(
		@IStorageService storageService: IStorageService,
		@IWorkbenchEnvironmentService private readonly workbenchEnvironmentService: IWorkbenchEnvironmentService,
		@IUserDataSyncStoreManagementService userDataSyncStoreManagementService: IUserDataSyncStoreManagementService,
		@IWorkspaceTrustService private readonly workspaceTrustService: IWorkspaceTrustService
	) {
		super(storageService, workbenchEnvironmentService, userDataSyncStoreManagementService);
	}

	canToggleEnablement(): boolean {
		return this.isTrusted() && super.canToggleEnablement();
	}

	isEnabled(): boolean {
		if (!this.isTrusted()) {
			return false;
		}
		if (this.enabled === undefined) {
			this.enabled = this.workbenchEnvironmentService.options?.settingsSyncOptions?.enabled;
		}
		if (this.enabled === undefined) {
			this.enabled = super.isEnabled(this.workbenchEnvironmentService.options?.enableSyncByDefault);
		}
		return this.enabled;
	}

	setEnablement(enabled: boolean) {
		if (this.canToggleEnablement()) {
			if (this.enabled !== enabled) {
				this.enabled = enabled;
				super.setEnablement(enabled);
				if (this.workbenchEnvironmentService.options?.settingsSyncOptions?.enablementHandler) {
					this.workbenchEnvironmentService.options.settingsSyncOptions.enablementHandler(this.enabled);
				}
			}
		}
	}

	private isTrusted(): boolean {
		return this.workspaceTrustService.getWorkspaceTrustState() === WorkspaceTrustState.Trusted;
	}

}
