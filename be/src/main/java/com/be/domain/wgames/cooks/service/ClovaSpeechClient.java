package com.be.domain.wgames.cooks.service;

import com.google.gson.Gson;
import jakarta.annotation.PostConstruct;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.FileEntity;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicHeader;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
public class ClovaSpeechClient {

    @Value("${external.naverClova-api-key}")
    private String naverClovaApiKey;

    @Value("${external.naverClova-invoke-url}")
    private String naverClovaInvokeUrl;

    // Clova Speech secret key
    private static String SECRET;
    // Clova Speech invoke URL
    private static String INVOKE_URL;

    // @PostConstruct로 초기화
    @PostConstruct
    public void init() {
        SECRET = naverClovaApiKey;
        INVOKE_URL = naverClovaInvokeUrl;
    }

    private CloseableHttpClient httpClient = HttpClients.createDefault();
    private Gson gson = new Gson();

    private static final Header[] HEADERS = new Header[]{
            new BasicHeader("Accept", "application/json"),
            new BasicHeader("X-CLOVASPEECH-API-KEY", SECRET),
    };

    public static class Boosting {
        private String words;

        public String getWords() {
            return words;
        }

        public void setWords(String words) {
            this.words = words;
        }
    }

    public static class Diarization {
        private Boolean enable = Boolean.FALSE;
        private Integer speakerCountMin;
        private Integer speakerCountMax;

        public Boolean getEnable() {
            return enable;
        }

        public void setEnable(Boolean enable) {
            this.enable = enable;
        }

        public Integer getSpeakerCountMin() {
            return speakerCountMin;
        }

        public void setSpeakerCountMin(Integer speakerCountMin) {
            this.speakerCountMin = speakerCountMin;
        }

        public Integer getSpeakerCountMax() {
            return speakerCountMax;
        }

        public void setSpeakerCountMax(Integer speakerCountMax) {
            this.speakerCountMax = speakerCountMax;
        }
    }

    public static class NestRequestEntity {
        private String language = "ko-KR";
        private String completion = "sync";
        private String callback;
        private Map<String, Object> userdata;
        private Boolean wordAlignment = Boolean.TRUE;
        private Boolean fullText = Boolean.TRUE;
        private List<Boosting> boostings;
        private String forbiddens;
        private Diarization diarization;

        public String getLanguage() {
            return language;
        }

        public void setLanguage(String language) {
            this.language = language;
        }

        public String getCompletion() {
            return completion;
        }

        public void setCompletion(String completion) {
            this.completion = completion;
        }

        public String getCallback() {
            return callback;
        }

        public Boolean getWordAlignment() {
            return wordAlignment;
        }

        public void setWordAlignment(Boolean wordAlignment) {
            this.wordAlignment = wordAlignment;
        }

        public Boolean getFullText() {
            return fullText;
        }

        public void setFullText(Boolean fullText) {
            this.fullText = fullText;
        }

        public void setCallback(String callback) {
            this.callback = callback;
        }

        public Map<String, Object> getUserdata() {
            return userdata;
        }

        public void setUserdata(Map<String, Object> userdata) {
            this.userdata = userdata;
        }

        public String getForbiddens() {
            return forbiddens;
        }

        public void setForbiddens(String forbiddens) {
            this.forbiddens = forbiddens;
        }

        public List<Boosting> getBoostings() {
            return boostings;
        }

        public void setBoostings(List<Boosting> boostings) {
            this.boostings = boostings;
        }

        public Diarization getDiarization() {
            return diarization;
        }

        public void setDiarization(Diarization diarization) {
            this.diarization = diarization;
        }
    }

    //장문 API
    public String upload(File file, NestRequestEntity nestRequestEntity) {
        HttpPost httpPost = new HttpPost(INVOKE_URL + "/recognizer/upload");
        httpPost.setHeaders(HEADERS);
        HttpEntity httpEntity = MultipartEntityBuilder.create()
                .addTextBody("params", gson.toJson(nestRequestEntity), ContentType.APPLICATION_JSON)
                .addBinaryBody("media", file, ContentType.create("audio/wav"), file.getName())
                .build();
        httpPost.setEntity(httpEntity);
        return execute(httpPost);
    }

    //단문 API
    public String upload2(File file, NestRequestEntity nestRequestEntity) {
        // URL에 쿼리 파라미터 추가 (예: lang, assessment, utterance, graph)
        String url = INVOKE_URL + "?lang=Kor&assessment=false&graph=false";

        // POST 요청을 위한 HttpPost 객체 생성
        HttpPost httpPost = new HttpPost(url);

        // 헤더 설정
        httpPost.setHeader("Content-Type", "application/octet-stream");
        httpPost.setHeader("X-CLOVASPEECH-API-KEY", SECRET);

        // 요청 본문에 파일 추가
        try {
            HttpEntity httpEntity = new FileEntity(file, ContentType.APPLICATION_OCTET_STREAM);
            httpPost.setEntity(httpEntity);
        } catch (Exception e) {
            throw new RuntimeException("Failed to build request entity", e);
        }

        // 요청 실행
        return execute(httpPost);
    }


    private String execute(HttpPost httpPost) {
        try (final CloseableHttpResponse httpResponse = httpClient.execute(httpPost)) {
            final HttpEntity entity = httpResponse.getEntity();
            return EntityUtils.toString(entity, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static void main(String[] args) {
        final ClovaSpeechClient clovaSpeechClient = new ClovaSpeechClient();
        NestRequestEntity requestEntity = new NestRequestEntity();

        // 화자 감지 설정
        ClovaSpeechClient.Diarization diarization = new ClovaSpeechClient.Diarization();
        diarization.setEnable(false); // 화자 감지 활성화
        diarization.setSpeakerCountMax(2); // 최대 2명 화자
        diarization.setSpeakerCountMin(1); // 최소 1명 화자
        requestEntity.setDiarization(diarization);

        final String result =
                clovaSpeechClient.upload2(new File("C:\\SSAFY\\S12P11E104\\be\\src\\main\\resources\\audio\\audio.wav"), requestEntity);
        System.out.println(result);
    }
}
