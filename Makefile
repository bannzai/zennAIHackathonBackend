
.PHONY: secret
secret:
	echo $(TEST_SERVICE_ACCOUNT_JSON) | base64 -d > secret/test-service-account.json
	echo $(FIREBASERC_FILE) | base64 -d > .firebaserc

