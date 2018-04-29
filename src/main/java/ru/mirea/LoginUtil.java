package ru.mirea;

import org.h2.security.SHA256;

public class LoginUtil {

    public static final String LOGIN_ATTR = "login";

    public static byte[] getPasswordHash(String login, String password) {
        return SHA256.getKeyPasswordHash(login, password.toCharArray());
    }
}
