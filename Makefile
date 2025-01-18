
.PHONY: secret
secret:
	echo $(FIREBASERC_FILE) | base64 -d > .firebaserc

