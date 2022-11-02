import { TestBed } from '@angular/core/testing';

import { OAuthConfigService } from './oauth-config.service';

describe('OauthConfigService', () => {
  let service: OAuthConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OAuthConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
