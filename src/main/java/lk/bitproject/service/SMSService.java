package lk.bitproject.service;

import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import com.twilio.Twilio;
import lk.bitproject.model.SMS;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;

@Component
public class SMSService {
    public static final String ACCOUNT_SID = "AC1623d3d8f0cd97f2758c0086600a54f2";
    public static final String AUTH_TOKEN = "75b4dbfd1204468414e906fc1f7a8545";
    public static final String FROM_NUMBER = "+12565889586";

    public void send(SMS sms) {
        Twilio.init(ACCOUNT_SID, AUTH_TOKEN);
        Message message = Message.creator(new PhoneNumber(sms.getTo()), new PhoneNumber(FROM_NUMBER), sms.getMessage())
                .create();
    }

    public void receive(MultiValueMap<String, String> smscallback) {
    }
}
