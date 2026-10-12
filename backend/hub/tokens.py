from django.contrib.auth.tokens import PasswordResetTokenGenerator


class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):

    def _make_hash_value(self, user, timestamp):
        return (
            str(user.pk)
            + str(timestamp)
            + str(user.is_active)
        )


class CustomPasswordResetTokenGenerator(PasswordResetTokenGenerator):
    pass


email_verification_token = EmailVerificationTokenGenerator()

password_reset_token = CustomPasswordResetTokenGenerator()